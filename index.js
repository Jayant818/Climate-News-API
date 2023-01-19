const express = require("express");
const axios = require("axios");
const morgan = require("morgan");
const cheerio = require("cheerio");
// const { contains } = require("cheerio");
// For Scarping Data we are Using a Library called "Cheerio" - It is used to manipulate the HTML

const app = express(); // Executing the Express Function

app.use(morgan("dev"));

const PORT = 8000;

// It contains sources from which we have to scarp data
const sources = [
	{
		name: "cityam",
		address:
			"https://www.cityam.com/london-must-become-a-world-leader-on-climate-change-action/",
		base: "",
	},
	{
		name: "thetimes",
		address: "https://www.thetimes.co.uk/environment/climate-change",
		base: "",
	},
	{
		name: "guardian",
		address: "https://www.theguardian.com/environment/climate-crisis",
		base: "",
	},
	{
		name: "telegraph",
		address: "https://www.telegraph.co.uk/climate-change",
		base: "https://www.telegraph.co.uk",
	},
	{
		name: "nyt",
		address: "https://www.nytimes.com/international/section/climate",
		base: "",
	},
	{
		name: "latimes",
		address: "https://www.latimes.com/environment",
		base: "",
	},
	{
		name: "smh",
		address: "https://www.smh.com.au/environment/climate-change",
		base: "https://www.smh.com.au",
	},
];
const articles = []; // It contains all the Scarped news
const getSpecificarticles = [];

sources.forEach((source) => {
	axios
		.get(source.address)
		.then((response) => {
			const html = response.data;
			const $ = cheerio.load(html);

			$('a:contains("climate")', html).each(function () {
				const title = $(this).text();
				const url = $(this).attr("href");

				articles.push({
					title,
					url: source.base + url,
					source: source.name,
				});
			});
		})
		.catch((err) => {
			console.log(err);
		});
});

//* How Scraping is Done
//* Using axios we get the Data from the Sources [this is actually the Full html webpage]
//* Axios return a promise so we can use the .then & .catch to resolve[reject] that Promise
//* After getting the Full webpage we use "" to scarp a particular Info. using it's Classes.

app.get("/", (req, res) => {
	res.send("<h1>Welcome to MY Climate News API</h1>");
});

app.get("/news", (req, res) => {
	res.json(articles);
});

app.get("/news/:newsId", (req, res) => {
	const newsId = req.params.newsId;
	const getSourceAddress = sources.filter((source) => source.name == newsId)[0]
		.address;
	const getSourceBase = sources.filter((source) => source.name == newsId)[0]
		.base;
	// res.send(getSource);
	axios
		.get(getSourceAddress)
		.then((res) => {
			const data = res.data;
			const $ = cheerio.load(data);
			$('a:contains("climate")', data).each(function () {
				const title = $(this).text;
				const url = $(this).attr("href");

				getSpecificarticles.push({
					title,
					url: getSourceBase + url,
					source: newsId,
				});
			});
		})
		.catch((err) => {
			console.log(err);
		});
	res.json(getSpecificarticles);
});

app.listen(PORT, () => {
	console.log("Listening on Port 8000");
});
