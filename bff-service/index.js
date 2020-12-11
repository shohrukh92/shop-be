const express = require("express");
const axios = require("axios").default;
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());

app.all("/*", (req, res) => {
  const { originalUrl, method, body } = req;
  console.log({ originalUrl, method, body });

  // original URL starts with '/' => we have to get second item after split
  const recipientService = originalUrl.split("/")[1];
  console.log({ recipientService });

  const recipientUrl = process.env[recipientService];
  console.log({ recipientUrl });

  if (recipientUrl) {
    const axiosConfig = {
      method,
      url: recipientUrl + originalUrl,
      ...(Object.keys(body || {}).length > 0 && { data: body }),
    };

    console.log({ axiosConfig });

    axios(axiosConfig)
      .then((response) => {
        console.log("Response from recipient", response.data);
        res.json(response.data);
      })
      .catch((error) => {
        console.log("Error", JSON.stringify(error));

        if (error.response) {
          // transfer back the error response from recipient
          const { status, data } = error.response;
          res.status(status).json(data);
        } else {
          // handle other errors
          res.status(500).json({ error: error.message });
        }
      });
  } else {
    // requested service does not exist in env variables
    res.status(502).json({ error: "Cannot process request" });
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
