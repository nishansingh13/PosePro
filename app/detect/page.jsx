'use client'

import * as tf from '@tensorflow/tfjs-core'
import '@tensorflow/tfjs-backend-webgl'
import * as posedetection from '@tensorflow-models/pose-detection'
import * as face from '@tensorflow-models/face-detection'
import Webcam from 'react-webcam'
import React, { useRef, useEffect, useState } from 'react'
import { checkbicepcurl, checkJump, checkSingleStand, checkSquat } from '../poseUtil'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function HomePage() {
  const keypointNames = [
    'nose', 'leftEye', 'rightEye', 'leftEar', 'rightEar',
    'leftShoulder', 'rightShoulder', 'leftElbow', 'rightElbow',
    'leftWrist', 'rightWrist', 'leftHip', 'rightHip',
    'leftKnee', 'rightKnee', 'leftAnkle', 'rightAnkle'
  ];

  const webcamRef = useRef(null)
  const canvasRef = useRef(null)
  const searchparams = useSearchParams()
  const exerciseid = searchparams.get('exercise')
  const { data: session, status } = useSession()
  const router = useRouter()

  const [isLoading, setIsLoading] = useState(true)
  const [keypoints, setKeypoints] = useState([])
  const [mode, setMode] = useState('pose')
  const [leftcurls, setLeftCurls] = useState(0)
  const [rightcurls, setRightCurls] = useState(0)
  const [durationOfSingleStand, setDurationOfSingleStand] = useState(0)
  const [startTime, setStartTime] = useState(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
    }
  }, [status])

  useEffect(() => {
    let poseDetector = null
    let faceDetector = null
    let isCancelled = false

    const loadModelAndRun = async () => {
      setIsLoading(true)
      await tf.setBackend('webgl')
      await tf.ready()

      if (mode === 'pose' || mode === 'both') {
        poseDetector = await posedetection.createDetector(
          posedetection.SupportedModels.MoveNet,
          { modelType: 'SinglePose.Lightning' }
        )
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

            if (!startTime) {
              setStartTime(new Date())
            }

            if (exerciseid == 1) {
              checkJump(poseKeypoints)
            } else if (exerciseid == 2) {
              let { left, right } = checkbicepcurl(poseKeypoints)
              setLeftCurls(left)
              setRightCurls(right)
            } else if (exerciseid == 3) {
              checkSquat(poseKeypoints)
            } else if (exerciseid == 4) {
              const val = checkSingleStand(poseKeypoints)
              setDurationOfSingleStand(val)
            }

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
    <div className="min-h-screen bg-gray-50 text-black p-6">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-screen">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <h2 className="text-2xl font-semibold text-gray-800">Loading model...</h2>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto">
          <header className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
            <h2 className="text-3xl font-bold text-gray-800">PosePro Exercise</h2>
            <div className="flex items-center space-x-2">
              <label className="font-medium text-gray-700">Detection Mode:</label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className="bg-white border border-gray-300 text-gray-800 px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="pose">Pose Detection</option>
                <option value="face">Face Detection</option>
                <option value="both">Pose + Face</option>
              </select>
            </div>
          </header>

          <div className="flex flex-col md:flex-row gap-6">
            <div className="relative w-[640px] h-[480px] rounded-xl overflow-hidden shadow-lg">
              <Webcam
                ref={webcamRef}
                className="absolute top-0 left-0 w-full h-full scale-x-[-1]"
                videoConstraints={{ width: 640, height: 480, facingMode: 'user' }}
              />
              <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg flex-1">
              <h3 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">Exercise Stats</h3>

              {startTime && (
                <div className="mb-4">
                  <p className="text-md text-gray-600">
                    <strong>Started at:</strong>{' '}
                    {startTime.toLocaleTimeString()}
                  </p>
                </div>
              )}

              {exerciseid == 2 && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg text-gray-600">Left Arm Curls:</span>
                    <span className="text-3xl font-bold text-blue-600">{leftcurls}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-lg text-gray-600">Right Arm Curls:</span>
                    <span className="text-3xl font-bold text-blue-600">{rightcurls}</span>
                  </div>
                  <div className="h-px bg-gray-200 my-3"></div>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium text-gray-700">Total Curls:</span>
                    <span className="text-4xl font-bold text-blue-700">{leftcurls + rightcurls}</span>
                  </div>
                </div>
              )}

              {exerciseid == 1 && (
                <div className="flex items-center justify-center h-32">
                  <span className="text-lg text-gray-600">Jump detection active</span>
                </div>
              )}

              {exerciseid == 3 && (
                <div className="flex items-center justify-center h-32">
                  <span className="text-lg text-gray-600">Squat detection active</span>
                </div>
              )}

           
            </div>
          </div>

          {keypoints.length > 0 && (
            <div className="mt-6 max-h-64 overflow-y-auto bg-white rounded-lg shadow p-4">
              <h4 className="text-lg font-semibold text-gray-700 mb-2">Detected Keypoints</h4>
              <ul className="space-y-1 text-sm text-gray-800">
                {keypoints.map((kp, index) => {
                  const name = keypointNames[index] || `Keypoint ${index}`
                  return (
                    <li key={index} className="flex justify-between border-b pb-1">
                      <span className="font-medium">{name}</span>
                      <span>
                        x: {kp.x.toFixed(2)}, y: {kp.y.toFixed(2)}, score: {kp.score.toFixed(2)}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
