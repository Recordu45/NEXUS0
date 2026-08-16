import {
  configure,
  checkPNRStatus,
  getTrainInfo,
  trackTrain,
  liveAtStation,
  searchTrainBetweenStations,
  getAvailability
} from "railkit";

const allowOrigin =
  process.env.NEXUS_ALLOWED_ORIGIN || "*";

function setCors(res) {
  res.setHeader(
    "Access-Control-Allow-Origin",
    allowOrigin
  );

  res.setHeader(
    "Access-Control-Allow-Methods",
    "POST, OPTIONS"
  );

  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type"
  );
}

function clean(value) {
  return typeof value === "string"
    ? value.trim()
    : value;
}

function ddmmyyyy(value) {
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(
      value || ""
    )
  ) {
    return value;
  }

  const [year, month, day] =
    value.split("-");

  return `${day}-${month}-${year}`;
}

export default async function handler(
  req,
  res
) {
  setCors(res);

  // Browser preflight
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  // Only POST allowed
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed"
    });
  }

  // API key must stay on server
  if (!process.env.RAILKIT_API_KEY) {
    return res.status(503).json({
      success: false,
      code: "API_KEY_MISSING",
      message:
        "Rail API is not configured. Add RAILKIT_API_KEY to the server environment."
    });
  }

  try {
    configure(
      process.env.RAILKIT_API_KEY
    );

    const body =
      req.body || {};

    const action =
      clean(body.action);

    let result;

    /* =========================
       PNR STATUS
    ========================= */

    switch (action) {

      case "pnr": {

        const pnr =
          clean(body.pnr);

        if (
          !/^\d{10}$/.test(
            pnr || ""
          )
        ) {
          return res.status(400).json({
            success: false,
            message:
              "PNR must contain exactly 10 digits."
          });
        }

        result =
          await checkPNRStatus(
            pnr
          );

        break;
      }


      /* =========================
         TRAIN INFORMATION
      ========================= */

      case "trainInfo": {

        const trainNumber =
          clean(
            body.trainNumber
          );

        if (
          !/^\d{5}$/.test(
            trainNumber || ""
          )
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Train number must contain exactly 5 digits."
          });
        }

        result =
          await getTrainInfo(
            trainNumber
          );

        break;
      }


      /* =========================
         LIVE TRAIN STATUS
      ========================= */

      case "live":
      case "delay": {

        const trainNumber =
          clean(
            body.trainNumber
          );

        if (
          !/^\d{5}$/.test(
            trainNumber || ""
          )
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Train number must contain exactly 5 digits."
          });
        }

        result =
          await trackTrain(
            trainNumber,
            ddmmyyyy(
              clean(body.date)
            )
          );

        break;
      }


      /* =========================
         TRAIN SEARCH
      ========================= */

      case "search":
      case "between": {

        const from =
          clean(body.from);

        const to =
          clean(body.to);

        if (!from || !to) {
          return res.status(400).json({
            success: false,
            message:
              "From and To stations are required."
          });
        }

        result =
          await searchTrainBetweenStations(
            from.toUpperCase(),
            to.toUpperCase(),
            body.date
              ? ddmmyyyy(
                  clean(body.date)
                )
              : undefined
          );

        break;
      }


      /* =========================
         SEAT AVAILABILITY
      ========================= */

      case "seat": {

        const trainNumber =
          clean(
            body.trainNumber
          );

        const from =
          clean(body.from);

        const to =
          clean(body.to);

        const date =
          clean(body.date);

        const classCode =
          clean(
            body.classCode
          );

        const quota =
          clean(
            body.quota ||
            "GN"
          );

        if (!trainNumber) {
          return res.status(400).json({
            success: false,
            message:
              "Train number is required."
          });
        }

        if (!from || !to) {
          return res.status(400).json({
            success: false,
            message:
              "From and To stations are required."
          });
        }

        if (!date) {
          return res.status(400).json({
            success: false,
            message:
              "Journey date is required."
          });
        }

        result =
          await getAvailability(
            trainNumber,
            from.toUpperCase(),
            to.toUpperCase(),
            ddmmyyyy(date),
            classCode,
            quota
          );

        break;
      }


      /* =========================
         STATION ARRIVAL / DEPARTURE
      ========================= */

      case "station":
      case "arrival":
      case "departure": {

        const stationCode =
          clean(
            body.stationCode
          );

        const hours =
          Number(body.hours) || 2;

        if (!stationCode) {
          return res.status(400).json({
            success: false,
            message:
              "Station code is required."
          });
        }

        result =
          await liveAtStation(
            stationCode.toUpperCase(),
            hours
          );

        break;
      }


      /* =========================
         UNKNOWN ACTION
      ========================= */

      default:

        return res.status(400).json({
          success: false,
          message:
            "Unknown rail action."
        });
    }


    /* =========================
       RESPONSE
    ========================= */

    return res
      .status(
        result?.success === false
          ? 502
          : 200
      )
      .json(result);


  } catch (error) {

    console.error(
      "NEXUS Rail API Error:",
      error
    );

    return res.status(502).json({

      success: false,

      code:
        "UPSTREAM_ERROR",

      message:
        error?.message ||
        "Rail service temporarily unavailable."

    });
  }
}
