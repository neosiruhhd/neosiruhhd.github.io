// ELEMENT REFERENCES -- instantiating a bunch of reference points for js to draw from the DOM (various html elements within the system hierarchy), trying to maintain the same labellings but with camel casing

const currentlyPlaying =
  document.querySelector("currently-playing");

const progressBar =
  document.querySelector("#progress-bar");

const progressBarContainer =
  document.querySelector("progress-bar-container");

// as in, play OR pause button
const playPauseButton =
  document.querySelector("#play-pause-button");

// as in, play OR pause img
const playPauseImg =
  document.querySelector("#play-pause-img");

const currentTime =
  document.querySelector("#current-time");

const duration =
  document.querySelector("#duration");

const quoteText =
  document.querySelctor("#quote-text");

const previousButton =
  document.querySelector("#previous-button");

const nextButton =
  document.querySelector("#next-button");

// PLAY / PAUSE -- functions to enable the user to play and pause the audio, this includes changing the image of the button which i need to change at some point as i do not have them rn

// this event listener is to recognise when the user physically clicks the button
playPauseButton.addEventListener
  ("click",
  togglePlayback);

  // then it will activate the if-else function 'togglePlayback'
function togglePlayback() {

  // in the scenario where the audio has been paused, it will:
  if (currentlyPlaying.paused) {
    
    // set the button into 'play' state, as in, ready to be played
    currentlyPlaying.play();
    // display the play icon
    playPauseImg.src = TO BE ADDED;
    playPauseImg.alt = "Play Icon";
  
    // if the audio is still playing
  } else {
   
    // keep the button in the 'pause' state, as in, ready to be paused
    currentlyPlaying.pause();
    // display the pause icon
    playPauseImg.src = TO BE ADDED;
    playPauseImg.alt = "Pause Icon";
  }

};

// RESET ICON -- for when the song ends naturally, turn into 'play' state
// leaving functioned unnamed since its a oneoff
currentlyPlaying.addEventListener(
  "ended",
  function () {
    playPauseImg.src TO BE ADDED;
    playPauseImg.alt "Play Icon";
  }
);

// TIME FORMATTING -- code to convert the time from purely seconds to m:ss format
// this function actually needs the parameter for time since it only operates based off that information
function formatTime(time) {
// isNaN checks if time is even in existence as a variable, if it isnt, show the default visual of 0:00
  if (isNaN(time)) return "0:00";
  // making the const within the function to separate it from the rest of the code, convinient!
  // Math.floor is a two parter: 'Math' is an object that contains various mathematical functions and constants, 'floor' is one of those Math functions.
  // written together, it rounds numbers down to the nearest whole integer, so we use this in both determining what is the current minute and second of the song we are playing
  const minutes =
    Math.floor(time / 60)

  const seconds =
    // the % is a bit weird, it gives you the REMAINING value after dividing. so like 10 % 3, would give you a remainder of 1, since 3 can go into 10 three times, and after that youre left with 1.
    // what its doing here is taking the time value (which is the whole song in length of seconds) and then after dividing it by its minutes, taking the value of the remaining seconds, CRAZY
    Math.floor(time % 60)
      .toString()
      // if the number is less than 10, adds a leading 0 to keep the seconds timer always showing 2 integers for visual consistency
      .padStart(2, "0");
// backticks, not quotation marks because this is not a regular string, its a template string, meaning its a string created from variables of the code and thus interpolates its outputted string
  return `${minutes}:${seconds}`;
}


// PROGRESS BAR -- code to update the progress bar as the song plays
// 'timeupdate' is a js media event that responds every time the playback position of the song changes, but it only recognises this change logically so, everytime it does i need it to run the 'updateProgress' function which updates the progress bar visually
currentlyPlaying.addEventListener(
  "timeupdate",
  updateProgress
);

function updateProgress() {

  // keeping consts within their functions
  const progress =
  // the current time of the song, divided by the total duration, then multiplied by 100.
    (currentlyPlaying.currentTime / duration) * 100;

  // the .style.width overrides any styling directions from the CSS that may have been previously stated, and instead changes the html element directly, super neat.
  // the amount of width is determined by simply adding a percentage sign to the end of the progress float
  progressBar.style.width = progress + "%";

  // 
  currentTime.textContent =
    formatTime(currentlyPlaying.currentTime);

  duration.textContent =
    formatTime(currentlyPlaying.duration);

}





// const videoList = [
//   { id: 1, src: "stardust.mp4" },
//   { id: 2, src: "zenscape.mp4" },
//   {
//     id: 3,
//     src: "https://thelongesthumstore.sgp1.cdn.digitaloceanspaces.com/IM-2250/miac.mp4",
//   },
// ];

// // ID'ing each video with a unique number, referencing videos 1 and 2 from the website's directory but sourcing the 3rd video from an online URL. 

// const myVideo = document.querySelector("#my-video");
// console.log(myVideo);

// const progressBar = document.querySelector("#progress-bar");
// console.log(progressBar);

// myVideo.addEventListener("timeupdate", updateProgress);

// function updateProgress() {
//   const duration = (myVideo.currentTime / myVideo.duration) * 100;
//   progressBar.style.width = duration + "%";
// }

// const playPauseButton = document.querySelector("#play-pause-button");
// console.log(playPauseButton);

// playPauseButton.addEventListener("click", togglePlayback);

// const playPauseImg = document.querySelector("#play-pause-img");
// console.log(playPauseImg);

// function togglePlayback() {
//   if (myVideo.paused || myVideo.ended) {
//     myVideo.play();
//     playPauseImg.src = "https://img.icons8.com/ios-glyphs/30/pause--v2.png";
//   } else {
//     myVideo.pause();
//     playPauseImg.src = "https://img.icons8.com/ios-glyphs/30/play--v2.png";
//   }
// }

// const muteUnmuteButton = document.querySelector("#mute-unmute-button");
// console.log(muteUnmuteButton);

// muteUnmuteButton.addEventListener("click", toggleAudio);

// const muteUnmuteImg = document.querySelector("#mute-unmute-img");
// console.log(muteUnmuteImg);

// function toggleAudio() {
//   if (myVideo.muted) {
//     myVideo.muted = false;
//     muteUnmuteImg.src =
//       "https://img.icons8.com/ios-glyphs/30/high-volume--v2.png";
//   } else {
//     myVideo.muted = true;
//     muteUnmuteImg.src = "https://img.icons8.com/ios-glyphs/30/no-audio--v1.png";
//   }
// }

// const stardustButton = document.querySelector("#stardust-vid-button");
// console.log(stardustButton);

// stardustButton.addEventListener("click", function chooseVideo() {
//   playVideo(0);
// });

// const zenscapeButton = document.querySelector("#zenscape-vid-button");
// console.log(zenscapeButton);

// zenscapeButton.addEventListener("click", function chooseVideo() {
//   playVideo(1);
// });

// const musicVideoButton = document.querySelector("#musicvideo-vid-button");
// console.log(musicVideoButton);

// musicVideoButton.addEventListener("click", function chooseVideo() {
//   playVideo(2);
// });

// function playVideo(no) {
//   myVideo.src = videoList[no].src;
//   console.log(myVideo.src);
//   myVideo.load();
//   myVideo.play();
// }

// const fullscreenButton = document.querySelector("#fullscreen-button");
// console.log(fullscreenButton);

// fullscreenButton.addEventListener("click", toggleFullscreen);

// function toggleFullscreen() {
//   if (!document.fullscreenElement) {
//     myVideo.requestFullscreen();
//   } else {
//     document.exitFullscreen();
//   }
// }

// const heartButton = document.querySelector("#heart-button");
// console.log(heartButton);

// heartButton.addEventListener("click", updateLikes);

// const likesContainer = document.querySelector("#likes");
// let likes = 0;

// function updateLikes() {
//   likes++;
//   likesContainer.textContent = likes;
// }

// const step1Button = document.querySelector("#step1-button");
// console.log(step1Button);

// step1Button.addEventListener("click", gotoStep1);

// function gotoStep1() {
//   myVideo.currentTime = 16.0;
// }

// const step2Button = document.querySelector("#step2-button");
// console.log(step2Button);

// step2Button.addEventListener("click", gotoStep2);

// function gotoStep2() {
//   myVideo.currentTime = 43.0;
// }

// const fastForwardButton = document.querySelector("#fast-forward-button");
// console.log(fastForwardButton);

// fastForwardButton.addEventListener("click", fastForward);

// function fastForward() {
//   if (myVideo.playbackRate === 1.0) {
//     myVideo.playbackRate = 2.0;
//   } else {
//     myVideo.playbackRate = 1.0;
//   }
// }
