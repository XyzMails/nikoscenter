"use strict";
(function() {
	function onReady(cb) {
		if (document.readyState !== "loading") cb();
		else document.addEventListener("DOMContentLoaded", cb());
	}

	onReady(function() {

	const rlInfoEl = document.querySelector("#ratelimit-info");
	if (!rlInfoEl) return;

	const timeFormat = new Intl.DateTimeFormat(undefined, {
		timeStyle: "long",
		dateStyle: "long",
	});
	const sleep = ms => new Promise(rs => setTimeout(rs, ms));

	function fetchRatelimitInfo() {
		return fetch("/api/v1/ratelimit_info")
			.then(resp => {
				if (resp.status === 200) {
					return resp.json().then(info => {
						const infoEl = document.createElement("p");
						infoEl.classList.add("web-desc");

						infoEl.innerText = `You have used ${info.limit - info.remaining} of your ${info.limit} downloads!`;

						const resetEl = document.createElement("p");
						resetEl.classList.add("web-desc");
						resetEl.innerText = `Your limit will reset on ${timeFormat.format(info.resetAt)}`;

						rlInfoEl.replaceChildren(infoEl, resetEl);
					})
				} else {
					return resp.json().then(json => {
						if (json.error === "ratelimited") {
							return sleep(1000).then(fetchRatelimitInfo);
						} else {
							throw new Error("Fetching information from the API has failed");
						}
					})
				}
			})
			.catch(err => {
				console.error(err);

				const errorEl = document.createElement("p");
				errorEl.classList.add("web-desc");

				errorEl.innerText = "Loading ratelimit information failed. ";

				const link = document.createElement("a");
				link.classList.add("blue");

				link.href = "/api/v1/ratelimit_info.html";
				link.innerText = "Check how many downloads have you used";

				errorEl.append(link);


				rlInfoEl.replaceChildren(errorEl);
			})
	}
	
	fetchRatelimitInfo().catch(console.error);
	});
})()
