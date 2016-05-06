window.onload = function () {

    init();

    // PRELOADER
    function showPreloader() {
        document.getElementById("loader").style.display = "block";
    }

    function hidePreloader() {
        document.getElementById("loader").style.display = "none";
    }
    // --------------------------------------------------

    // CUSTOM CONTROLS

    var playButton = document.getElementById("playpause");
    var muteButton = document.getElementById('mute');
    var fullScreenButton = document.getElementById("fs");
    var video = document.querySelector('video');
    var progress = document.getElementById('progress');
    var progressBar = document.getElementById('progress-bar');


    //mute
    muteButton.addEventListener("click", function() {
        if (video.muted == false) {
            video.muted = true;
            muteButton.setAttribute('data-state', 'unmute');
        } else {
            video.muted = false;
            muteButton.setAttribute('data-state', 'mute');
        }
    });

    //fullscreen
    fullScreenButton.addEventListener("click", function() {
        if (video.requestFullscreen) {
            video.requestFullscreen();
        } else if (video.mozRequestFullScreen) {
            video.mozRequestFullScreen(); // Firefox
        } else if (video.webkitRequestFullscreen) {
            video.webkitRequestFullscreen(); // Chrome and Safari
        }
    });

    progress.addEventListener('click', function(e) {
        var coords = e.target.getBoundingClientRect();
        var left = coords.left + pageXOffset;
        var pos = (e.pageX - left) / this.offsetWidth;
        video.currentTime = (pos * video.duration);
        console.log(video.duration);
    });

    //play
    playButton.addEventListener("click", function() {
        if (video.paused == true) {
            video.play();
            playButton.setAttribute('data-state', 'pause');
        } else {
            video.pause();
            playButton.setAttribute('data-state', 'play');
        }

        video.addEventListener('timeupdate', function() {
            // For mobile browsers, ensure that the progress element's max attribute is set
            progress.setAttribute('max', video.duration);
            progress.value = video.currentTime;
            progressBar.style.width = Math.floor((video.currentTime / video.duration) * 100) + '%';
        });
    });



    // -----------------------------------------------


    function loadJSON(callback) {
        var xobj = new XMLHttpRequest();
        xobj.overrideMimeType("application/json");
        xobj.open('GET', './movies.json', true); // Replace 'my_data' with the path to your file
        xobj.onreadystatechange = function() {
            if (xobj.readyState == 4 && xobj.status == "200") {
                hidePreloader();
                // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
                callback(xobj.responseText);
            }
        };
        xobj.send(null);
        showPreloader()
    };

    function init() {
        loadJSON(function(response) {
            var moviesData = JSON.parse(response);
            var moviesList = document.getElementsByClassName('movies-list-items')[0]

            //change video on click
            moviesList.addEventListener('click', changeVideo)

            //load all movies
            for (var i = 0; i < moviesData.length; i++) {
                moviesList.appendChild(createMovieItem(moviesData[i]))
            }
            function createMovieItem(data) {
                var moviesItem = document.createElement('li');
                moviesItem.className = "movies-item";
                var cover = data.images.cover;
                var title = data.title;
                var year = data.meta.releaseYear;
                moviesItem.innerHTML = '<div class="movies-item-image"><img src="./img/' + cover + '" alt="'+ title +'" /></div><div class="movies-item-description"><h3 class="movies-item-title">' + title + '</h3><p class="movies-item-release_Date">' + year + '</p></div>';
                // console.log(cover, title, year);
                return moviesItem;
            };

            function changeVideo(e) {
                var player = document.querySelector('.player');
                var oldVideo = document.querySelector('video');
                var target = event.target;
                if (target.tagName != 'IMG') return;
                var title = target.getAttribute("alt");
                playButton.setAttribute('data-state', 'play');
                muteButton.setAttribute('data-state', 'mute');
                //search and get the right data using title
                for (var i = 0; i < moviesData.length; i++) {
                    if (moviesData[i].title == title) {
                        var streams = moviesData[i].streams;
                        var poster = moviesData[i].images.placeholder;
                        var director = moviesData[i].meta.directors[0].name;
                        var newVideo = createVideo(streams, poster);
                        video = newVideo;
                        console.log(video);
                        changeDescription(title, director)
                        player.replaceChild(newVideo, oldVideo)
                    }
                }
            };

            function changeDescription(title, director) {
                var title = document.querySelector('.description-title').innerHTML = title;
                var director = document.querySelector('.director').innerHTML = director;
            }

            function createVideo(streams, poster) {
                // console.log(streams, poster);
                var video = document.createElement('video');
                video.setAttribute('poster', "./img/" + poster);
                // video.setAttribute('controls', true);
                for (var i = 0; i < streams.length; i++) {
                    var src = streams[i].url;
                    var type = streams[i].type;
                    var source = document.createElement('source');
                    source.setAttribute('src', src);
                    source.setAttribute('type', "video/" + type);
                    video.appendChild(source)
                    //console.log(src, type, source);
                }
                // console.log(video);
                return video;
            }

        });
    }
}
