let timeStarted = 0;
let isRCurling = false;
let isLCurling = false;
let lcurlCount = 0;
let rcurlCount = 0;
function calculateAngle(A, B, C) {
  const AB = { x: A.x - B.x, y: A.y - B.y };
  const CB = { x: C.x - B.x, y: C.y - B.y };

  const dotProduct = AB.x * CB.x + AB.y * CB.y;
  const magAB = Math.sqrt(AB.x ** 2 + AB.y ** 2);
  const magCB = Math.sqrt(CB.x ** 2 + CB.y ** 2);

  const angleRad = Math.acos(dotProduct / (magAB * magCB));
  const angleDeg = (angleRad * 180) / Math.PI;

  return angleDeg;
}// Keep state outside the function
let startTime = null;
let isPosing = false;
let duration = 0;
let currentDuration = 0;

export function checkSingleStand(keypoints) {
  const leftHip = keypoints[11];
  const rightHip = keypoints[12];
  const leftKnee = keypoints[13];
  const rightKnee = keypoints[14];
  const leftAnkle = keypoints[15];
  const rightAnkle = keypoints[16];
  const leftWrist = keypoints[9];
  const rightWrist = keypoints[10];

  const isConfident = [
    leftHip, rightHip,
    leftKnee, rightKnee,
    leftAnkle, rightAnkle,
    leftWrist, rightWrist
  ].every(p => p && p.score > 0.5);

  if (!isConfident) return { duration: 0, active: false };

  const wristHipThreshold = 80;

  const leftWristToHip = Math.hypot(leftHip.x - leftWrist.x, leftHip.y - leftWrist.y);
  const rightWristToHip = Math.hypot(rightHip.x - rightWrist.x, rightHip.y - rightWrist.y);
  const handsOnHips = leftWristToHip < wristHipThreshold && rightWristToHip < wristHipThreshold;

  const ankleKneeThreshold = 80;

  
  const rightAnkleToLeftKnee = Math.hypot(rightAnkle.x - leftKnee.x, rightAnkle.y - leftKnee.y);
  const rightAnkleAboveLeftKnee = rightAnkle.y < leftKnee.y;


  const leftAnkleToRightKnee = Math.hypot(leftAnkle.x - rightKnee.x, leftAnkle.y - rightKnee.y);
  const leftAnkleAboveRightKnee = leftAnkle.y < rightKnee.y;

  const legLifted =
    (rightAnkleToLeftKnee < ankleKneeThreshold && rightAnkleAboveLeftKnee) ||
    (leftAnkleToRightKnee < ankleKneeThreshold && leftAnkleAboveRightKnee);

  if (handsOnHips && legLifted) {
    if (!isPosing) {
      isPosing = true;
      startTime = Date.now();
      console.log("✅ Single stand posture started");
    }
    // Continuously update the current duration while in pose
    currentDuration = Date.now() - startTime;
    return { duration: currentDuration, active: true };
  } else {
    if (isPosing) {
       duration = Date.now() - startTime;
      isPosing = false;
      startTime = null;

      if (duration > 2000) {
        console.log(`🕒 Single stand held for ${Math.floor(duration / 1000)} seconds`);
      } else {
        console.log("❌ Posture broke too soon");
      }
    }
    return { duration: 0, active: false };
  }
}



function rightCurl(keypoints) {
  const shoulder = keypoints[6];
  const elbow = keypoints[8];
  const wrist = keypoints[10];

  if (shoulder.score > 0.4 && elbow.score > 0.4 && wrist.score > 0.4) {
    const angle = calculateAngle(shoulder, elbow, wrist);

    const curlStartThreshold = 50;  
    const curlEndThreshold = 160;   

    if (!isRCurling && angle <= curlStartThreshold) {
      isRCurling = true;
      console.log("Right curl started");
    }

    if (isRCurling && angle >= curlEndThreshold) {
      isRCurling = false;
      rcurlCount++;
      console.log(`Right curl completed! Count: ${rcurlCount}`);
    }
  }
  return rcurlCount
}

function leftCurl(keypoints) {
  const shoulder = keypoints[5];
  const elbow = keypoints[7];
  const wrist = keypoints[9];

  if (shoulder.score > 0.4 && elbow.score > 0.4 && wrist.score > 0.4) {
    const angle = calculateAngle(shoulder, elbow, wrist);

    const curlStartThreshold = 50;   // Curl started (bent elbow)
    const curlEndThreshold = 160;    // Arm extended (curl reset)

    if (!isLCurling && angle <= curlStartThreshold) {
      isLCurling = true;
      console.log("Left curl started");
    }

    if (isLCurling && angle >= curlEndThreshold) {
      isLCurling = false;
      lcurlCount++;
      console.log(`Left curl completed! Count: ${lcurlCount}`);
    }
  }

  return lcurlCount;
}


export function checkbicepcurl(keypoints) {
  const left = leftCurl(keypoints);
  const right = rightCurl(keypoints);
  return { left, right };
  

}

  let isSquatting = false
  let squatCount = 0
  
  export function checkSquat(keypoints) {
    const leftHip = keypoints[11]
    const rightHip = keypoints[12]
    const leftKnee = keypoints[13]
    const rightKnee = keypoints[14]
  
    if (
      leftHip.score > 0.4 &&
      rightHip.score > 0.4 &&
      leftKnee.score > 0.4 &&
      rightKnee.score > 0.4
    ) {
      const avgHipY = (leftHip.y + rightHip.y) / 2
      const avgKneeY = (leftKnee.y + rightKnee.y) / 2
  
      if (!isSquatting && avgHipY > avgKneeY + 20) {
        isSquatting = true
        console.log('Squat Down Detected')
      } else if (isSquatting && avgHipY < avgKneeY - 10) {
        isSquatting = false
        squatCount++
        console.log(`Squat Count: ${squatCount}`)
      }
    }
  }
  let jumpBaseline = null
  let jumpCooldown = false
  
  export function checkJump(keypoints) {
    const leftAnkle = keypoints[15]
    const rightAnkle = keypoints[16]
  
    if (leftAnkle.score > 0.4 && rightAnkle.score > 0.4) {
      const avgY = (leftAnkle.y + rightAnkle.y) / 2
  
      if (!jumpBaseline) {
        jumpBaseline = avgY
        return
      }
  
      if (!jumpCooldown && avgY < jumpBaseline - 40) {
        console.log('Jump detected!')
        jumpCooldown = true
        setTimeout(() => (jumpCooldown = false), 1000) // 1 second cooldown
      }
    }
  }
