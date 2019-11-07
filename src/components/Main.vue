<template>
<div width="100%" hight="100%"> 
<div class="toolbar">
    <div class="toolbar-buttons">
        <input v-bind:class="['toolbar-search-input', $mq === 'lg' ? 'toolbar-search-input-lg' : 'toolbar-search-input-sm']" v-model.trim="searchString" v-on:keyup.enter="search()" autocomplete="on" list="cities" v-bind:placeholder="$mq === 'lg' ? 'Search city by name or postal code' : 'Enter city or postal code'">
        <datalist id="cities">
            <option class="toolbar-search-list-item" v-for="(city, index) in cities" v-bind:key="index">{{city}}</option>
        </datalist>
        <button v-bind:class="['toolbar-search-button', $mq === 'lg' ? 'toolbar-search-button-lg' : 'toolbar-search-button-sm']" v-on:click="search()">Search</button>
        <select v-bind:class="['toolbar-history', $mq === 'lg' ? 'toolbar-history-lg' : 'toolbar-history-sm']" v-if="history" v-on:change="historyOnChange">
            <option selected="selected" class="list-header">History</option>
            <option v-bind:value="item"  v-for="(item, index) in Object.keys(history).slice().reverse()" v-bind:key="index">
                {{item}} {{ history[item].temperature | addSign }} {{ history[item].humidity }}%
            </option>
        </select>
    </div>
    <div v-if="searchError" class="toolbar-error">{{ searchError }}</div>
    <div v-if="loading" class="toolbar-loading">Loading...</div>
</div>
<div>
    <div v-if="currentData" class="current-weather">
        <div v-bind:class="[$mq === 'lg' ? 'current-weather-main-lg' : 'current-weather-main-sm']">
            <div class="current-weather-main-city">Weather in {{ currentData.city }}</div>
            <div class="current-weather-main-date">Today {{now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}}</div>
            <div class="current-weather-main-temperature">{{ currentData.data.temperature | addSign }}°</div>
        </div>
        <div v-bind:class="[$mq === 'lg' ? 'current-weather-details-lg' : 'current-weather-details-sm']">
            <div>Humidity {{ currentData.data.humidity }}%</div>
            <div>Wind {{ currentData.data.wind_speed }} m/s</div>
        </div>
    </div>
    <div v-if="forecastData" class="weather-forecast">
        <div v-if="$mq === 'lg'" class="weather-forecast-table-lg">
            <div class="weather-forecast-cell-lg" v-for="(item, index) in forecastData.data" v-bind:key="index">
                <div class="weather-forecast-lg-column">
                    <div class="weather-forecast-lg-column-header">
                    {{ index == 0 ? "Tomorrow, " + new Date(item.dt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : new Date(item.dt).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }) }}
                    </div>
                    <div class="weather-forecast-lg-column-data">
                        <span v-bind:title="'Temperature ' + addSign(item.temperature) + '°'">
                        {{ item.temperature | addSign }}°
                        </span>
                    </div>
                    <div class="weather-forecast-lg-column-data">
                        <span v-bind:title="'Humidity ' + item.humiditity + '%'">
                        {{ item.humidity }}%
                        </span>
                    </div>
                    <div class="weather-forecast-lg-column-data">
                        <span v-bind:title="'Wind ' + item.wind_speed + ' m/s'">
                        {{ item.wind_speed }} m/s
                        </span>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="$mq === 'sm'"> 
            <div class="weather-forecast-table-sm" v-for="(item, index) in forecastData.data" v-bind:key="index">
                <div class="weather-forecast-cell-sm weather-forecast-cell-sm-day">{{ index == 0 ? "Tomorrow" : new Date(item.dt).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) }}</div>
                <div class="weather-forecast-cell-sm weather-forecast-cell-sm-temperature">{{ item.temperature | addSign }}°</div>
                <div class="weather-forecast-cell-sm weather-forecast-cell-sm-humidity">{{ item.humidity }}%</div>
                <div class="weather-forecast-cell-sm weather-forecast-cell-sm-wind">{{ item.wind_speed }} m/s</div>
             </div>
        </div>

    </div>
</div>
</div>
</template>

<script>
function addSign(value){
    if(value === undefined)
        return '';   
    if (value > 0)
        return '+' + value;
    return value;
}

export default {
    name: "Main",
    data(){
        return {
            now: new Date(),
            cities: [],
            weatherData : null,
            searchString: null,
            searchError: null,
            loading: false,
            history: {}
        }
    },
    computed: {
        currentData: function () {
            if (!this.weatherData || this.weatherData.data.length == 0)
                return null;

            return {
                city : this.weatherData.city,
                data: this.weatherData.data[0]
            };
        },
        forecastData: function () {
            if (!this.weatherData || this.weatherData.data.length < 2)
                return null;

            return {
                city : this.weatherData.city,
                data: this.weatherData.data.slice(1)
            };
        }
    },
    methods: {
            historyOnChange : function (event) {
                this.fetchDataByCity(event.target.options[event.target.selectedIndex].value);
                event.target.options[0].selected = true;
            },
            addSign : addSign,
            search : function (){
                if (!this.searchString)
                {
                    this.searchError = 'Empty search string';
                    return;
                }

                if (this.appConfig.SEARCH_CITY_MASK.test(this.searchString))
                {
                    this.fetchDataByCity(this.searchString);

                } else if (this.appConfig.SEARCH_ZIP_CODE_MASK.test(this.searchString))
                {
                    this.fetchDataByZipCode(this.searchString);
                }
                else
                    this.searchError = `${this.searchString} is not a valid search string`;
            },
            fetchDataByCity(city){
                this.fetchData(`${this.appConfig.API_URI}/forecast/?city=${city},${this.appConfig.COUNTRY_CODE}`);
            },
            fetchDataByZipCode(zipCode){
                this.fetchData(`${this.appConfig.API_URI}/forecast/?zipCode=${zipCode},${this.appConfig.COUNTRY_CODE}`);
            },
            fetchData: function (uri) {
                this.searchError = null;
                this.loading = true;

                this.$http.get(uri)
                          .then((response) => {
                            if (response.data)    
                            {
                                this.weatherData = response.data;
                                this.addHistory(this.currentData);
                            }
                            else
                                this.searchError = `No weather forecast found for ${this.searchString}`;
                          }).catch((error) => {
                            this.searchError = `Unable to get weather forecast for ${this.searchString}`;
                            window.console.error('Unable to get items.', error);
                          }).finally(() => {
                            this.searchString = null;
                            this.loading = false;
                          });
            },
            addHistory: function(data){
                if (!data) {
                    return;
                }

                if(this.history.hasOwnProperty(data.city))
                {
                    delete  this.history[data.city];
                }

                this.history[data.city] = {
                    temperature: data.data.temperature,
                    humidity: data.data.humidity
                }

                if (Object.keys(this.history).length > this.appConfig.HISTORY_SIZE)
                {
                    delete this.history[Object.keys(this.history)[0]];
                }

                const parsed = JSON.stringify(this.history);
                localStorage.setItem('history', parsed);
            },
    },
    created: function () {
            this.fetchDataByCity(this.appConfig.DEFAULT_CITY);
            this.cities = this.citiesList;
    },
    mounted() {
        if (localStorage.getItem('history')) {
            try {
                this.history = JSON.parse(localStorage.getItem('history'));
            } catch(e) {
                localStorage.removeItem('history');
            }
        }
    },
    filters: {
        addSign: addSign
    }
}
</script>

<style>
    .list-header{
        display: none;
    }
    .toolbar{
        background : blue;
        height: 56px;
        width: 100%;
    }
    .toolbar-buttons{
        width: 95%;
        height: 30px;
        background: white;
        margin: 14px 10px 12px;
        display: inline-block;
        border: 1px solid grey;
    }
    .toolbar-error{
        position: absolute;
        color: red;
        margin: 0px 20px;
    }
    .toolbar-loading{
        position: absolute;
        color: white;
        margin: 0px 20px;
    }
    .toolbar-search-input{
        height: 29px;
        font-size: 15px;
        border: none;
        display: inline-block;
    }
    .toolbar-search-input-sm{
        width: 60%;
    }
    .toolbar-search-input-lg{
        width: 70%;
    }
    .toolbar-search-list-item{
        font-size: 15px;
    }
    .toolbar-search-button{
        height: 30px;
        background: orange;
        cursor: pointer;
        border: none;
        display: inline-block;
    }
    .toolbar-search-button-sm{
        width: 15%;
    }
    .toolbar-search-button-lg{
        width: 10%;
    }
    .toolbar-search-list-item{
        font-size: 15px;
    }
    .toolbar-history{
        height: 30px;
        display: inline-block;
        text-align-last: center;
    }
    .toolbar-history-sm{
        width: 25%;
    }
    .toolbar-history-lg{
        width: 20%;
    }
    .current-weather{
        background : rgba(0,0,0,0.5);
        margin: 20px;
    }
    .current-weather-main-sm{
        padding: 20px 30px;
    }
    .current-weather-main-lg{
        padding: 20px 30px;
        display: inline-block;
    }
    .current-weather-main-city{
        font-size: 22px;
    }
    .current-weather-main-date{
        font-size: 15px;
    }
    .current-weather-main-temperature{
        font-size: 100px;
        text-align: center;
    }
    .current-weather-details-lg{
        padding: 20px 20px;
        font-size: 35px;
        display: inline-block;
    }
    .current-weather-details-sm{
        padding: 0px 20px;
        font-size: 35px;
    }
    .weather-forecast{
        background : rgba(0,0,0,0.5);
        margin: 20px;
    }
    .weather-forecast-table-sm{
        width: 100%;
        display: table;
        margin: 10px;
    }
    .weather-forecast-table-lg{
        width: 100%;
        display: table;
    }
    .weather-forecast-cell-sm{
        display: table-cell;
    }
    .weather-forecast-cell-lg{
        width: 20%;
        display: table-cell;
    }
    .weather-forecast-cell-sm-day{
        font-size: 22px;
        width: 50%
    }
    .weather-forecast-cell-sm-temperature{
        font-size: 17px;
        width: 15%
    }
    .weather-forecast-cell-sm-humidity{
        font-size: 17px;
        width: 15%
    }
    .weather-forecast-cell-sm-wind{
        font-size: 17px;
        width: 20%
    }
    .wether-forecast-lg-column{
        display: inline-block;
    }
    .weather-forecast-lg-column-header{
        font-size: 25px;
        text-align: center;
    }
    .weather-forecast-lg-column-data{
        padding: 15px;
        font-size: 20px;
        text-align: center;
    }
</style>