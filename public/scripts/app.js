console.log("app.js is working!");

$(document).ready(function(){

//global variables
const baseUrl = 'http://localhost:3000/api/';
const users = 'users/';
const comments = 'comments/';
const zomato = 'https://developers.zomato.com/api/v2.1';
const zomatoKey = "64ec316d35f97e2df01286cf2d5f00df";
const commentResults = document.getElementById('comment-container')
const smallScreen = window.matchMedia('(max-width: 760px)');

  /////////SMOOTH SCROLL/////////////////

  //smooth scroll for navigation -- any anchor tag 
  $('.nav-buttons a').on('click', function(event) {
    if (smallScreen.matches) {
      openCloseMobileNav();
    };
    if (this.hash !== '') {
      event.preventDefault();
      let hash = this.hash;

      $('html, body').animate({
        scrollTop: $(hash).offset().top
    }, 

      800, function(){
        window.location.hash = hash;
      });
    }
  });

  /////////////////////////////////
  /////SMALL SCREEN NAVIGATION/////
  /////////////////////////////////

  function openCloseMobileNav() {
    //toggle hamburger, close icons
    $('.fa-bars').toggleClass('hamburger-icon');
    $('.fa-times').toggleClass('close-icon');
    $('.fa-times').toggleClass('hide');
    //toggle dropdown
    $('nav').toggleClass('small-screen-nav');
    $('.nav-buttons').toggleClass('nav-buttons-small-screen');
  };

  $('.fa-bars').on('click', openCloseMobileNav);
  $('.fa-times').on('click', openCloseMobileNav);


////////////////////////////////////////
/////////ABOUT US PIC CAROUSEL//////////
////////////////////////////////////////



let images = [];

images[0] = 'images/team/image1.jpg';
images[2] = 'images/team/image2.jpg';
images[3] = 'images/team/image3.jpg';
images[4] = 'images/team/image4.jpg';
images[5] = 'images/team/image5.jpg';
images[6] = 'images/team/image6.jpg';
images[7] = 'images/team/image7.jpg';
images[8] = 'images/team/image8.jpg';
images[9] = 'images/team/image9.jpg';
images[10] = 'images/team/image10.jpg';

var changeImg = () => {
  let i = 0;
  let time = 3000;
  document.slide.src = images[i];

  if(i < images.length - 1) {
    i++;
  } else {
    i = 0;
  }

  setTimeout('changeImg()', time);
}
  window.onload = changeImg;


  ////////////////////////////////////////
  /////SEARCH FOR RESTAURANTS BY CITY/////
  ////////////////////////////////////////

  //matches searched city name to zomato City ID
  function findCityId (event) {
    event.preventDefault();

    //Remove results section
    $('.results-section').empty();

    //scroll to results
    document.querySelector('.results-section').scrollIntoView({behavior: 'smooth', block: 'start'});

    const query = encodeURI(document.getElementById('cityName').value);
    let cityId = null;  
    fetch(`${zomato}/cities?q=${query}`, {
      headers: {
        "user-key": zomatoKey
      }
    }).then(res => res.json())
      .then(data => {
        cityId = data.location_suggestions[0].id;
        getCityRestaurants(cityId);
    });
  };

  //Finds Zomato restaurants by Zomato CityID
  function getCityRestaurants(cityId) {
    fetch(`${zomato}/search?entity_id=${cityId}&entity_type=city`, {
      headers: {
        "user-key": "64ec316d35f97e2df01286cf2d5f00df"
      }
    })
      .then(res => res.json())
      .then((data) => {
        const restaurants = data.restaurants;
        foundRestaurants(restaurants);
      });
  };


  ///////////////////////////////
  ///////RESTAURANT CAROUSEL/////
  ///////////////////////////////

  //Get array of all restaurants for a city
  //Show first restaurant in results section
  const foundRestaurants = (data) => {
    let foundRestaurantsArray = data;
    let i = 0;
    
    //show first restaurant initially
    let rImage = foundRestaurantsArray[0].restaurant.featured_image || "images/plate.jpg";
    let rName = foundRestaurantsArray[0].restaurant.name;
    let rAddress = foundRestaurantsArray[0].restaurant.location.address;
    $('.results-section').css({'height': '100vh', 'background-color': '#3a3a3a'});
    $('.results-section').append(`
      <section class="name-address">
        <h2 class="restaurant-name">${rName}</h2>
        <h3 class="restaurant-address">${rAddress}</h3>
      </section>

      <section class="restaurant-carousel">
        <button class="previous-restaurant">Previous</button>
        <button class="icon previous-icon"><i class="fas fa-caret-left previous-icon"></i></button>
        <img src="${rImage}" alt="Photo of food at ${rName}."/>
        <button class="next-restaurant">Next</button>
        <button class="icon next-icon"><i class="fas fa-caret-right next-icon"></i></button>
      </section>
      `);

    //when user selects next button, show next restaurant
    function goNext() {
      if (i < foundRestaurantsArray.length - 1) {
        i++;
      } else {
        i=0;
      };

      let nextImage = foundRestaurantsArray[i].restaurant.featured_image || "images/plate.jpg";
      let nextName = foundRestaurantsArray[i].restaurant.name;
      let nextAddress = foundRestaurantsArray[i].restaurant.location.address;
      $('.restaurant-name').text(nextName);
      $('.restaurant-address').text(nextAddress);
      $('.restaurant-carousel img').attr('src', nextImage);
    };

    //when user selects previous, show previous restaurant
    function goPrevious() {
      if (i > 0 && i < foundRestaurantsArray.length - 1) {
        i--
      };

      let nextImage = foundRestaurantsArray[i].restaurant.featured_image || "images/plate.jpg";
      let nextName = foundRestaurantsArray[i].restaurant.name;
      let nextAddress = foundRestaurantsArray[i].restaurant.location.address;
      $('.restaurant-name').text(nextName);
      $('.restaurant-address').text(nextAddress);
      $('.restaurant-carousel img').attr('src', nextImage);
    };

    $('.next-icon').on('click', goNext);
    $('.next-restaurant').on('click', goNext);

    $('.previous-icon').on('click', goPrevious);
    $('.previous-restaurant').on('click', goPrevious);

  }; 


  /////////////////////////////
  ////////COMMENTS/////////////
  /////////////////////////////

  //add new comment and save to db
  const handleCommentSubmit = (event) => {
    event.preventDefault();
    const userComment = document.getElementById('message').value;
    const commentData = { message: userComment };

    fetch((baseUrl + comments), {
        method: "POST",
        headers: {
            "Content-Type": "application/json; charset=utf-8",
        },
        body: JSON.stringify(commentData),
    })
      .then(res => res.json())
      .then((data) => {
        getComments();
      })
      .catch(err => console.log(err));
  };

  //get all comments
  const getComments = () => {
    fetch(baseUrl + comments)
      .then(res => res.json())
      .then(comments => renderComments(comments))
      .catch(err => console.log(err));
  }

  getComments();

  //build comments content on UI from db
  const renderComments = (comments) => {
    let commentContainer = document.getElementById('comment-container');

    //clears each time so no duplicate data
    commentResults.innerHTML = '';
    document.querySelector('.comments-form').children[0] = '';
    document.querySelector('.comments-form').children[1] = '';

    comments.forEach(comment => {
      commentContainer.insertAdjacentHTML('afterbegin', `
        <div class="comment-results">
            <p><strong>${comment.user.username}</strong></p>
            <p><strong>${comment.message}</strong></p>
            <br/>
            <small id="${comment._id}">EDIT</small>
            <small id="${comment._id}">DELETE</small>
        </div>
      `);
      
/////////////////TRYING TO STYLE COMMENT-RESULTS SECTION/////////////////////////////////
      // document.getElementById('comment-results').css({'display': 'flex', 'flex-direction': 'column', 'justify-content': 'center', 'align-items': 'center'})
//////////////////////////////////////////////////////////////////////////////////////////
    
    });

    commentCarousel();
  };

  //comment carousel
  function commentCarousel() {
    console.log('Carouselling...')
    let commentIndex = 0;
    $('#comment-container').children().eq(0).attr('class', 'show');
    setInterval(function() {
      const commentResultsArray = $('#comment-container').children();
      commentIndex += 1;
      if (commentIndex > commentResultsArray.length-1) {commentIndex = 0}
      commentResultsArray.eq(commentIndex).siblings().attr('class', 'comment-results');
      commentResultsArray.eq(commentIndex).attr('class', 'show');  

    },9000);
  };


  //////Edit and Delete Comments//////

  const handleEditDelete = (event) => {
    //delete comment
    if (event.target.innerText === 'DELETE') {
      fetch(baseUrl + comments + event.target.id, { method: 'DELETE', })
        .then(() => getComments())
        .catch(err => console.log(err));
    
    //edit comment
    } else if(event.target.innerText === 'EDIT') {
      const parent = event.target.parentNode;
      const commentName = parent.children[0].innerText;
      const commentMessage = parent.children[1].innerText;
      const commentId = parent.children[2].id;

      //create edit comment form
      parent.insertAdjacentHTML('beforeend', `
        <div id="editComment">
          <input id="editCommentName" name="name" type="text" value="${commentName}">
          <input id="editCommentMessage" name="message" type="text" value="${commentMessage}">
          <button id="editCancel">CANCEL</button>
          <button id="editSubmit" data-id="${commentId}">SUBMIT</button>
        </div>
      `);

    //cancel->remove edit comment form
    } else if(event.target.id === 'editCancel') {
      const commentForm = document.getElementById('editComment');
      commentForm.remove();

    //save changes -> submit 
    } else if(event.target.id === 'editSubmit') {
      let commentId = event.target.getAttribute('data-id');
      const newCommentName = document.getElementById('editCommentName').value;
      const newCommentMessage = document.getElementById('editCommentMessage').value;
      const newCommentData = {username: newCommentName, message: newCommentMessage};
      
      if (newCommentName.length !== 0 && newCommentMessage.length !== 0) {
        fetch(baseUrl + comments + commentId, {
          method: 'PUT',
          headers: {
            "Content-Type": "application/json; charset=utf-8"
          },
          body: JSON.stringify(newCommentData)
        })
          .then(() => getComments());
      };

      };
  };




  $('#cuisine-submit').on('click', findCityId);
  $('#comment-submit').on('click', handleCommentSubmit);
  $('#comment-container').on('click', handleEditDelete);


});
//////DOCUMENT END//////
