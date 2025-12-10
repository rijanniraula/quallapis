const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "ngrok-skip-browser-warning",
    ],
  })
);
app.use(express.json());

//get car details
app.post("/api/bids/cars/vehicleNumberDetails", async (req, res) => {
  const vehicleNumber = req.body.carNumber;

  try {
    const carDetails = await fetch(
      `${process.env.AWS_BASE_URL}/bids/cars/vehicleNumberDetails`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ carNumber: vehicleNumber }),
      }
    ).then((response) => response.json());

    console.log(carDetails);

    res.status(200).json(carDetails);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch car details" });
  }
});

//get bid results
app.post("/api/get-bid-results", async (req, res) => {
  const carDetails = req.body;

  // try {
  const response = await fetch(`${process.env.AWS_BASE_URL}/bids/cars`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(carDetails),
  });

  if (!response.ok) {
    const text = await response.text(); // don’t call .json() yet
    console.error("API error:", response.status, text);
    return res.status(response.status).send(text);
  }

  const responseData = await response.json();
  console.log({ responseData });
  const jobId = responseData?.job_id;

  // wait before polling results
  await new Promise((resolve) => setTimeout(resolve, 5000));

  const responseBidResults = await fetch(`${process.env.AWS_BASE_URL}/jobs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ job_id: jobId }),
  });

  const resultsData = await responseBidResults.json();
  console.log({ resultsDataResults: resultsData });
  res.status(200).json({ data: resultsData });

  // } catch (error) {
  //   res.status(500).json({ error: "Failed to create bid" });
  // }
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
