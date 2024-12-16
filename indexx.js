import songs from "./index.js";
console.log(songs);
const PLAYER_STORAGE_KEY = "MUSIC-APP"

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
const heading = document.querySelector("header h2");
const audio = document.querySelector("#audio");
const singer = document.querySelector("h5");
const cdThumb = document.querySelector(".cd-thumb");
const cd = document.querySelector(".cd");
const progressIndex = document.querySelector(".progress");
const playBtn = document.querySelector(".btn-toggle-play");
const player = document.querySelector(".player");
const nextBtn = document.querySelector(".btn-next");
const prevBtn = document.querySelector(".btn-prev");
const randomBtn = document.querySelector(".btn-random");
const repeatBtn = document.querySelector(".btn-repeat");
const playList = document.querySelector(".playlist");
const toastBox = document.querySelector("#toast");


const cdPlay = cdThumb.animate(
  [{ transform: "rotate(0deg)" }, { transform: "rotate(360deg)" }],
  {
    duration: 20000,
    iterations: Infinity
  }
);
cdPlay.pause();
// xử lý sự kiện nút play
audio.onplay = () => {
  player.classList.add("playing");
  app.isPlaying = true;
  audio.play();
  cdPlay.play();
};
audio.onpause = () => {
  player.classList.remove("playing");
  app.isPlaying = false;
  audio.pause();
  cdPlay.pause();
};

const app = {
  songs,
  currentIndex: 0,
  isPlaying: false,
  isRandom: false,
  isRepeat: false,
  listSongs: [],
  config : JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
  setConfig : function (key , value){
    this.config[key] = value
    localStorage.setItem(PLAYER_STORAGE_KEY , JSON.stringify(this.config))
  },

toast : function ({title = "", message ="" , type ="", duration}){
  if(toastBox){
    const main = document.createElement('div');
    setTimeout(() => {
        toastBox.removeChild(main)
    }, duration + 2000);
    const icons = {
      next:"fa-solid fa-forward",
      prev: "fa-solid fa-backward",
      random : "fa-solid fa-shuffle",
      replay:"fa-solid fa-reply",
      pause: "fa-solid fa-pause",
      play:"fa-solid fa-play"
    }
      const iconsBox = icons[type]
    main.classList.add('toast', `toast--${type}` );
    main.innerHTML = `
    <div class="toast-icon">
        <i class="${iconsBox}"></i>
      </div>
      <div class="toast-body">
        <h3 class="toast-title"> ${title}</h3>
        <p class="toast-msg">${message}</p>
      </div>
      <div class="toast-close">
        <i class="fa-solid fa-xmark"></i>
      </div>
    `
    toastBox.appendChild(main)
  }

},



  // xử lý bài hát đầu tiên
  currentIndexSong: function () {
    return this.songs[this.currentIndex];
  },

  toastInfoSongs : function ({title="", message= "", type= "",duration=3000}){
   
      const mainn = document.createElement('div')
      mainn.classList.add('toast', `toast--${type}`)
      setTimeout(() => {
          toastBox.removeChild(mainn)
      }, duration+1000);
      const icon = {
        success :"fa-solid fa-check"
      }
      const boxIcon = icon[type]
      mainn.innerHTML = `
        <div class="toast-icon">
        <i class="${boxIcon}"></i>
      </div>
      <div class="toast-body">
        <h3 class="toast-title">${title} ${this.currentIndexSong().name}</h3>
        <p class="toast-msg">${message} ${this.currentIndexSong().singer}</p>
      </div>
      <div class="toast-close">
        <i class="fa-solid fa-xmark"></i>
      </div>
      `
    
    toastBox.appendChild(mainn)
  },



  //   xủ lý render list bài hát
  render: function () {
    const html = this.songs
      .map((song, index) => {
        return `
        <div class="song ${index === this.currentIndex ? "active" : ""}" data-index=${index}>
            <div class="thumb" style="background-image: url('${song.image}')">
            </div>
            <div class="body">
              <h3 class="title">${song.name}</h3>
              <p class="author">${song.singer}</p>
            </div>
            <div class="option">
              <i class="fas fa-ellipsis-h"></i>
            </div>
          </div>
        `;
      })
      .join("");
    $(".playlist").innerHTML = html;
  },
  loadSongs: function () {
    heading.innerHTML = `${this.currentIndexSong().name}`;
    singer.innerHTML = `${this.currentIndexSong().singer}`;
    cdThumb.style.backgroundImage = `url('${this.currentIndexSong().image}')`;
    audio.src = `${this.currentIndexSong().path}`;
  },
  handleEvent: function () {
    // xử lý sự kiện cd cuộn
    const widthDefault = cd.offsetWidth;
    document.onscroll = () => {
      const widthScroll = window.scrollY || document.documentElement.scrollTop;
      const newWidth = widthDefault - widthScroll;
      if (newWidth > 0) {
        cd.style.width = newWidth + "px";
      } else {
        cd.style.width = 0;
      }
      cd.style.opacity = newWidth / widthDefault;
    };

    // xử lý tua bài hát
    audio.ontimeupdate = () => {
      if (audio.duration) {
        const progressCurrent = (audio.currentTime / audio.duration) * 100;
        progressIndex.value = progressCurrent;
        // console.log(progressCurrent);
      }
    };
    progressIndex.oninput = () => {
      // console.log(progressIndex.value);
      const progressPercent = (progressIndex.value * audio.duration) / 100;
      audio.currentTime = progressPercent;
    };

    // xử lý nút play
    playBtn.onclick = () => {
      if (this.isPlaying) {
        audio.pause();
        app.showPause()
      } else {
        audio.play();
        app.showPlay()
      }
    };

    // xử lý nút next songs
    nextBtn.onclick = () => {
      if (app.isRandom) {
        app.randomSongs();
        app.currentIndexActiveSongs();
        app.listSongsScroll();
        app.showNext()
        audio.play();
        cdPlay.cancel();
        cdPlay.play();
      } else {
        app.nextSongs();
        app.currentIndexActiveSongs();
        app.listSongsScroll();
        app.showNext()
        audio.play();
        cdPlay.cancel();
        cdPlay.play();

      }
    };

    // xử lý nút trở về bài hát trước
    prevBtn.onclick = () => {
      audio.currentTime = 0;
      audio.play();
    };
    prevBtn.ondblclick = () => {
      if (app.isRandom) {
        app.randomSongs();
        app.currentIndexActiveSongs();
        app.listSongsScroll();
        app.showPrev()
        audio.play();
        cdPlay.cancel();
        cdPlay.play();
      } else {
        app.prevSongs();
        app.currentIndexActiveSongs();
        app.listSongsScroll();
        app.showPrev();
        audio.play();
        cdPlay.cancel();
        cdPlay.play();
      }
    };

    // xử lý nút random
    randomBtn.onclick = () => {
      if(!app.isRandom){
        app.isRandom = true
        randomBtn.classList.add('active')
      app.showRandomOn()

      }else{
        app.isRandom = false
        randomBtn.classList.remove('active')
        app.showRandomOff()

      }
      app.setConfig("isRandom", app.isRandom)

      // app.isRandom = !app.isRandom;
      // randomBtn.classList.toggle("active", app.isRandom);
      // app.showRandomOn()
    };

    // xử lý nút lặp lại
    repeatBtn.onclick = () => {
      if(app.isRepeat){
        app.isRepeat = false
        repeatBtn.classList.remove('active')
        app.showReplayOff()

      }else{
        app.isRepeat = true
        repeatBtn.classList.add('active')
        app.showReplayOn()

      }
      // app.isRepeat = !app.isRepeat;
      // app.showReplay();
      // repeatBtn.classList.toggle("active", app.isRepeat);
      app.setConfig("isRepeat" , app.isRepeat)
    };

    // xử lý sự kiện lặp lại
    audio.onended = () => {
      if (app.isRepeat) {
        audio.currentTime = 0;
        audio.play();
      } else {
        nextBtn.click();
      }
    };

    // xử lý click từng bài hát
    playList.onclick = (e) => {
      const nodeSongs = e.target.closest(".song:not(.active)");
      if (nodeSongs || e.target.closest(".option")) {
        if (nodeSongs) {
          app.currentIndex =Number (nodeSongs.dataset.index);
          app.loadSongs();
          app.currentIndexActiveSongs()
          cdPlay.play();
          audio.play();
          cdPlay.cancel();
          app.showInfo()
     
        }
      }
    };
  },

  // xử lý cách hoạt  động sang bài hát tiếp theo
  nextSongs: function () {
    this.currentIndex++;
    if (this.currentIndex >= this.songs.length) {
      this.currentIndex = 0;
    }
    this.loadSongs();
  },

  // xử lý hoạt động trở về bài trước
  prevSongs: function () {
    this.currentIndex--;
    if (this.currentIndex < 0) {
      this.currentIndex = this.songs.length - 1;
    }
    this.loadSongs();
  },
  // xử lý random bài hát
  randomSongs: function () {
    var random;

    do {
      random = Math.floor(Math.random() * this.songs.length);
    } while (this.currentIndex === random || this.listSongs.includes(random));
    this.listSongs.push(random);
    if (this.listSongs.length === this.songs.length) {
      this.listSongs = [];
    }
    this.currentIndex = random;
    this.loadSongs();
  },

  // xử lý cuộn màn hình khi bấm next bài
  listSongsScroll: function () {
    setTimeout(() => {
      $(".song.active").scrollIntoView({
        behavior: "smooth",
        block: "end",
        inline: "nearest"
      });
    }, 200);
  },

  // xử lý active từng bài
  currentIndexActiveSongs: function () {
    const currentIndexActive = $(".song.active");
    if (currentIndexActive) {
      currentIndexActive.classList.remove("active");
    }
    const indexActive = $$(".song")[this.currentIndex];
    if (indexActive) {
      indexActive.classList.add("active");
    }
  },
  loadConfig : function(){
    this.isRandom = this.config.isRandom
    this.isRepeat = this.config.isRepeat
    randomBtn.classList.toggle("active", app.isRandom);
    repeatBtn.classList.toggle("active", app.isRepeat);


    
  },

  showNext : function (){
    this.toast({
      title: "Next Song",
      message:"Bạn đã chuyển bài tiếp theo",
      type:"next",
      duration:3000
    })
  },
  showPrev : function (){
    this.toast({
      title: "Prev Song",
      message:"Bạn đã quay lại bài trước đó",
      type:"prev",
      duration:3000
    })
  },
  showRandomOn : function (){
    this.toast({
      title: "Mode Random Song : On",
      message:"Bạn đang bật chế độ bài hát ngẫu nhiên",
      type:"random",
      duration:3000
    })
  },
  showRandomOff : function (){
    this.toast({
      title: "Mode Random Song : Off",
      message:"Bạn đang tắt chế độ bài hát ngẫu nhiên",
      type:"random",
      duration:3000
    })
  },
  showReplayOn : function (){
    this.toast({
      title: "Mode Replay Song : On",
      message:"Bạn đã bật chế độ phát lại bài hát",
      type:"replay",
      duration:3000
    })
  },
  showReplayOff : function (){
    this.toast({
      title: "Mode Replay Song : Off",
      message:"Bạn đã tắt chế độ phát lại bài hát",
      type:"replay",
      duration:3000
    })
  },
  showPlay : function (){
    this.toast({
      title: "Play Song",
      message:"Bạn đã phát bài hát",
      type:"play",
      duration:3000
    })
  },
  showPause : function (){
    this.toast({
      title: "Pause Song ",
      message:"Bạn đã dừng bài hát",
      type:"pause",
      duration:3000
    })
  },
showInfo : function (){
  this.toastInfoSongs({
    title: "Bạn đang phát bài hát :",
    message:"ca sĩ :",
    type: "success",
    duration: 3000
  })
},

  // bắt đầu
  start: function () {
    // hàm render ra list bài hát
    this.render();

    // hàm xử lý bài hát đầu tiên
    this.currentIndexSong();

    // hàm xử lý bài hát đầu tiên
    this.loadSongs();

    // hàm xử lý event
    this.handleEvent();

    this.loadConfig();

    this.toast()

    this.toastInfoSongs()
  }
};

app.start();
