
'use client'

import * as tf from '@tensorflow/tfjs-core'
import '@tensorflow/tfjs-backend-webgl'
import * as posedetection from '@tensorflow-models/pose-detection'
import * as face from '@tensorflow-models/face-detection'
import Webcam from 'react-webcam'
import React, { useRef, useEffect, useState, use } from 'react'
import { checkbicepcurl, checkJump, checkSquat } from '../poseUtil'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
export default function HomePage() {
  const webcamRef = useRef(null)
  const canvasRef = useRef(null)
  const {data:session, status} = useSession()
  const router = useRouter()
  const [exercise, setExercise] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [keypoints, setKeypoints] = useState([])
  const [mode, setMode] = useState('pose')
  useEffect(()=>{
    if(status === 'unauthenticated'){
      router.push('/')
    }
  },[status])

  useEffect(() => {
  
  
    let poseDetector = null
    let faceDetector = null
    let isCancelled = false

    const loadModelAndRun = async () => {
      setIsLoading(true)

      await tf.setBackend('webgl')
      await tf.ready()

  
      if (mode === 'pose' || mode === 'both') {
        const poseModel = posedetection.SupportedModels.MoveNet
        poseDetector = await posedetection.createDetector(poseModel, {
          modelType: 'SinglePose.Lightning',
        })
      }

      if (mode === 'face' || mode === 'both') {
        faceDetector = await face.createDetector(face.SupportedModels.MediaPipeFaceDetector, {
          runtime: 'tfjs',
          modelType: 'short',
        })
      }

      setIsLoading(false)

      const detect = async () => {
        if (
          isCancelled ||
          !webcamRef.current ||
          webcamRef.current.video.readyState !== 4
        ) {
          requestAnimationFrame(detect)
          return
        }

        const video = webcamRef.current.video
        const videoWidth = video.videoWidth
        const videoHeight = video.videoHeight

        webcamRef.current.video.width = videoWidth
        webcamRef.current.video.height = videoHeight
        canvasRef.current.width = videoWidth
        canvasRef.current.height = videoHeight

        const ctx = canvasRef.current.getContext('2d')
        ctx.clearRect(0, 0, videoWidth, videoHeight)


        ctx.save()
        ctx.scale(-1, 1)
        ctx.translate(-videoWidth, 0)
        


        if (poseDetector && (mode === 'pose' || mode === 'both')) {
          const poses = await poseDetector.estimatePoses(video)
          if (poses.length > 0) {
            const poseKeypoints = poses[0].keypoints
            
            setKeypoints(poseKeypoints)
            checkSquat(poseKeypoints)
            checkJump(poseKeypoints)
            checkbicepcurl(poseKeypoints)

            poseKeypoints.forEach((kp) => {
              if (kp.score > 0.4) {
                ctx.beginPath()
                ctx.arc(kp.x, kp.y, 5, 0, 2 * Math.PI)
                ctx.fillStyle = 'red'
                ctx.fill()
              }
            })
          }
        }

     

        requestAnimationFrame(detect)
      }

      detect()
    }

    loadModelAndRun()

    return () => {
      isCancelled = true
    }
  }, [mode])

  return (
    <div className="min-h-screen bg-black text-white p-5">
      {isLoading && <h2 className="text-2xl font-semibold">Loading model...</h2>}

      {!isLoading && (
        <>
          <h2 className="text-2xl font-semibold mb-4">AI Vision Playground</h2>

          <div className="mb-4">
            <label className="mr-2">Choose Model:</label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="text-white px-2 py-1 rounded"
            >
              <option value="pose" className='text-black'>Pose Detection</option>
              <option value="face" className='text-black'>Face Detection</option>
              <option value="both" className='text-black'>Pose + Face</option>
            </select>
          </div>

          <div className="relative w-[640px] h-[480px] mb-6">
            <Webcam
               
              ref={webcamRef}
              className="absolute top-0 left-0 w-full h-full rounded-lg scale-x-[-1]"

              videoConstraints={{
                width: 640,
                height: 480,
                facingMode: 'user',
              }}
            />
            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0 w-full h-full"
            />
          </div>

          {keypoints.length > 0 && (mode === 'pose' || mode === 'both') && (
            <div>
              <h3 className="text-lg font-medium mb-2">Detected Keypoints:</h3>
              <ul className="text-sm max-h-[200px] overflow-y-auto space-y-1">
                {keypoints.map((kp, i) => (
                  <li key={i}>
                    <span className="font-semibold">{kp.name}</span>: (x: {kp.x.toFixed(1)}, y: {kp.y.toFixed(1)}, score: {kp.score?.toFixed(2)})
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    
    </div>
  )
}
