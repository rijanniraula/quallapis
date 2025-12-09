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
app.get("/api/car-details/:vehicleNumber", async (req, res) => {
  const vehicleNumber = req.params.vehicleNumber;

  try {
    const carDetails = await fetch(
      `${process.env.BASE_API_URL}/bids/cars/vehicleNumberDetails/${vehicleNumber}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.TOKEN}`,
          "Content-Type": "application/json",
        },
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
  const response = await fetch(`${process.env.BASE_API_URL}/bids/cars`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.TOKEN}`,
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
  // const taskId =
  //   responseData?.data?.taskId || "7f3a2b10-9c42-4e7c-8c6a-81e9b3f42d91";
  const taskId = "7f3a2b10-9c42-4e7c-8c6a-81e9b3f42d91";

  const responseBidResults = await fetch(
    `${process.env.BASE_API_URL}/bids/cars/${taskId}/results`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.TOKEN}`,
      },
    }
  );

  const resultsData = await responseBidResults.json();
  res.status(200).json({ data: resultsData });

  // } catch (error) {
  //   res.status(500).json({ error: "Failed to create bid" });
  // }
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
