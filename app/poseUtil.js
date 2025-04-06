let timeStarted = 0;
let isRCurling = false;
let isLCurling = false;
let lcurlCount = 0;
let rcurlCount = 0;

export function checkbicepcurl(keypoints) {
  const leftShoulder = keypoints[5];
  const rightShoulder = keypoints[6];
  const leftWrist = keypoints[9];
  const rightWrist = keypoints[10];

  if (
    (leftShoulder?.score > 0.4 && leftWrist?.score > 0.4) ||
    (rightShoulder?.score > 0.4 && rightWrist?.score > 0.4)
  ) {
    const dx_right = rightWrist.x - rightShoulder.x;
    const dy_right = rightWrist.y - rightShoulder.y;
    const dx_left = leftWrist.x - leftShoulder.x;
    const dy_left = leftWrist.y - leftShoulder.y;

    const distance_right = Math.sqrt(dx_right ** 2 + dy_right ** 2);
    const distance_left = Math.sqrt(dx_left ** 2 + dy_left ** 2);

    // Right Arm
    if (!isRCurling && distance_right <= 110) {
      isRCurling = true;
      console.log("Right arm curl detected");
    } else if (isRCurling && distance_right > 310) {
      isRCurling = false;
      rcurlCount++;
      console.log("Right arm curl completed", rcurlCount);
    }


    if (!isLCurling && distance_left <= 110) {
      isLCurling = true;
      timeStarted = Date.now();
      console.log("Left arm curl detected");
    } else if (isLCurling && distance_left > 310) {
      isLCurling = false;
      const timeTaken = Date.now() - timeStarted;
      if (timeTaken >= 1000) {
        console.log("Left arm curl completed", timeTaken);
        lcurlCount++;
      } else {
        console.log("Left arm curl too fast", timeTaken);
      }
    }
  }

  return false;
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
      