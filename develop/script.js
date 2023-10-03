// Define the OpenWeatherMap API key
var APIkey = "700fcef39d666c6cff248fa3fb8923f5";

// Get a reference to the search button element
var searchBtn = document.getElementById("searchBtn");

// Initialize an empty array to store the list of cities
var listOfCities = [];

// Check if there is a "history" item in local storage and populate listOfCities if it exists
if(localStorage.getItem("history")) {
    listOfCities = JSON.parse(localStorage.getItem("history"))
}

// Function to perform a weather search when the search button is clicked
function performSearch () {
    // Get the value entered in the input field and trim any leading/trailing whitespace
    var inputVal = document.getElementById("cityToSearch").value.trim();

    // Add the input value to the listOfCities array
    listOfCities.push(inputVal)

    // Store the updated listOfCities array in local storage
    localStorage.setItem('history', JSON.stringify(listOfCities));

    // Call the weatherSearch and forecastSearch functions with the input value
    weatherSearch(inputVal)
    forecastSearch(inputVal)
}

// Function to perform a weather search for a given city
function weatherSearch(city) {
    // Construct the URL for the weather API request
    var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&units=imperial&appid=" + APIkey;

    // Fetch weather data from the API
    fetch(queryURL)
    .then(function(result) {
        return result.json()
    })
    .then(function (data) {
        // Update weather-related elements in the DOM with the received data
        var weatherIcon = document.getElementById('weather-icon');
        var dataIcon = data.weather[0].icon
        weatherIcon.setAttribute("src", `https://openweathermap.org/img/wn/${dataIcon}.png`)

        var cityName = document.getElementById("city-name");
        cityName.textContent = data.name;

        var today = dayjs().format('MM/DD/YYYY');
        document.getElementById("current-date").textContent = today
        document.getElementById("temp").textContent = "Temp: " + data.main.temp + " \u00B0F";
        document.getElementById("wind").textContent = "Wind: " + data.wind.speed + " MPH";
        document.getElementById("humid").textContent = "Humidity: " + data.main.humidity + "%";

        // Call the renderHistory function to update the history of searched cities
        renderHistory()
    })
}

// Attach the performSearch function to the click event of the search button
searchBtn.addEventListener("click", performSearch);

// Function to perform a forecast search when called
function forecastSearch() {
    var userInput = document.getElementById('cityToSearch').value.trim();
    futureWeatherSearch(userInput);
}

// Function to perform a future weather search for a given city
function futureWeatherSearch(cityName) {
    // Construct the URL for the forecast API request
    var queryURL = `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${APIkey}&units=imperial`

    // Fetch forecast data from the API
    fetch(queryURL)
    .then(function(result) {
        return result.json()
    })
    .then(function(data) {
        console.log(data)
        var arrOfTimes = data.list; // array of 40 items
        // Attempt to normalize the data to get only noon items
        var arrOfFilteredTimes = [];

        for(i=0; i< arrOfTimes.length; i++) {
            if(arrOfTimes[i].dt_txt.split(" ")[1] == "12:00:00") {
                arrOfFilteredTimes.push(arrOfTimes[i])
            }
        }

        // Call the renderForecast function to update the forecast data in the DOM
        renderForecast(arrOfFilteredTimes)
    })    
}

// Function to render the forecast data in the DOM
function renderForecast(arr) {
    for(i =0; i<arr.length; i++) {
        var givenDate = arr[i].dt_txt.split(" ")[0]

        var properDate = givenDate.split('-');
        console.log(properDate)
        document.getElementById("date-" + i).textContent = properDate[1] + "/" + properDate[2] + "/" + properDate[0]
        document.getElementById("icon-" + i).innerHTML = `<img src="https://openweathermap.org/img/wn/${arr[i].weather[0].icon}.png"/>`
        document.getElementById("temp-" + i).textContent = "Temp: " + arr[i].main.temp + " \u00B0F"
        document.getElementById("wind-" + i).textContent = "Wind: " + arr[i].wind.speed + " MPH"
        document.getElementById("humid-" + i).textContent = "Humidity:" + arr[i].main.humidity + "%"
    }
}

// Function to render the search history buttons in the DOM
function renderHistory() {
  const historyElement = document.getElementById("history");
  historyElement.innerHTML = "";

  for (let i = 0; i < listOfCities.length; i++) {
      const newBtn = document.createElement("button");
      newBtn.textContent = listOfCities[i];
      newBtn.addEventListener("click", function (e) {
          weatherSearch(e.target.textContent);
          futureWeatherSearch(e.target.textContent);
      });
      newBtn.style.margin = "5px";
      newBtn.style.padding = "5px";
      historyElement.appendChild(newBtn);
  }
}

// Call the renderHistory function to initially render the search history
renderHistory()
