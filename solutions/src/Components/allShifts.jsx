import { useEffect, useState } from "react";
import { formatUnixTimestamp } from "../utils";
import { BASE_URL } from "../constant";
import "../assets/allShifts.css";

const AllShifts = ({
  bookedShifts = [],
  setSelectedFilter = () => {},
  fetchShiftData = () => {},
}) => {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingId, setLoadingId] = useState("");
  const [cities, setCities] = useState([]);
  const [activeFilter, setActiveFilter] = useState("");
  const [eventCount, setEventCount] = useState(null);
  const now = Date.now();

  const filterEvents = () => {
    const allEvents = bookedShifts.map((event) => {
      const { formattedTime: formattedStartTime, formattedDate } =
        formatUnixTimestamp(event.startTime);
      const { formattedTime: formattedEndTime } = formatUnixTimestamp(
        event.endTime
      );
      const isEventStarted = now >= event.startTime;
      return {
        ...event,
        formattedDate,
        formattedStartTime,
        formattedEndTime,
        isEventStarted,
        status: event.booked ? "Booked" : "Available",
      };
    });

    // Check for overlapping events
    for (let i = 0; i < allEvents.length; i++) {
      if (allEvents[i].booked) continue;

      for (let j = 0; j < allEvents.length; j++) {
        if (i !== j && allEvents[j].booked) {
          if (
            (allEvents[i].startTime < allEvents[j].endTime &&
              allEvents[i].startTime >= allEvents[j].startTime) ||
            (allEvents[i].endTime > allEvents[j].startTime &&
              allEvents[i].endTime <= allEvents[j].endTime)
          ) {
            allEvents[i].status = "Overlapping";
            break;
          }
        }
      }
    }

    // Group by area and date
    const groupedEvents = allEvents.reduce((acc, event) => {
      if (!acc[event.area]) {
        acc[event.area] = {};
      }
      if (!acc[event.area][event.formattedDate]) {
        acc[event.area][event.formattedDate] = [];
      }
      acc[event.area][event.formattedDate].push(event);
      return acc;
    }, {});

    for (const area in groupedEvents) {
      for (const date in groupedEvents[area]) {
        groupedEvents[area][date].sort((a, b) => a.startTime - b.startTime);
      }
    }

    const eventCounts = {};
    for (const area in groupedEvents) {
      eventCounts[area] = 0;
      for (const date in groupedEvents[area]) {
        eventCounts[area] += groupedEvents[area][date].length;
      }
    }

    setShifts(groupedEvents);
    setEventCount(eventCounts);
  };

  const filterCityData = () => {
    const cityNames = bookedShifts.map((item) => item?.area);
    const uniqueCityNamesSet = new Set(cityNames);
    const uniqueCityNamesArray = [...uniqueCityNamesSet];
    setCities(uniqueCityNamesArray);
    setSelectedFilter(uniqueCityNamesArray[0]);
    setActiveFilter(uniqueCityNamesArray[0]);
  };

  useEffect(() => {
    filterCityData();
    filterEvents();
  }, [bookedShifts]);

  useEffect(() => {
    filterEvents();
  }, [activeFilter]);

  const handleCancelEvent = async (eventId, action) => {
    try {
      setLoading(true);
      setLoadingId(eventId);

      let res = await fetch(`${BASE_URL}shifts/${eventId}/${action}`, {
        method: "POST",
      });

      if (res.status === 200) {
        fetchShiftData();
      } else {
        throw new Error("something went wrong!");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingId("");
      setLoading(false);
    }
  };
  const getColor = (status) => {
    switch (status) {
      case "Overlapping":
        return "#e2006a";
      default:
        return "#4f6c92";
    }
  };

  return (
    <div className="container">
      <div className="wrapper">
        <div className="filterWrapper">
          {cities?.map((_val) => {
            return (
              <span
                key={_val}
                className={`cityName ${activeFilter === _val ? "active" : ""}`}
                onClick={() => setActiveFilter(_val)}
              >
                {_val} ({eventCount[_val]})
              </span>
            );
          })}
        </div>
        {shifts.length === 0 || shifts[activeFilter]?.length === 0 ? (
          <div>No events found</div>
        ) : (
          Object.entries(shifts[activeFilter]).map((_val, idx) => {
            return (
              <div key={_val[0]} className="card">
                <div className="head">
                  <span className="headDate">{_val[0]}</span>
                </div>
                {_val[1].map((entries) => {
                  const action = entries?.booked ? "cancel" : "book";
                  const isBtnDisabled =
                    entries?.isEventStarted || entries?.status === "Overlapping"
                      ? entries?.booked
                        ? "disable-r"
                        : "disable-g"
                      : "";
                  return (
                    <div key={entries?.id} className="listWrapper">
                      <div className="leftSection">
                        <span className="time">
                          {entries?.formattedStartTime}-
                          {entries?.formattedEndTime}
                        </span>
                      </div>
                      <div className="rightSection">
                        <span
                          className="status"
                          style={{ color: getColor(entries?.status) }}
                        >
                          {entries?.status}
                        </span>
                        <button
                          className={`button ${
                            isBtnDisabled ? isBtnDisabled : action
                          }`}
                          onClick={() => handleCancelEvent(entries.id, action)}
                          disabled={isBtnDisabled !== ""}
                        >
                          {loading && loadingId === entries?.id ? (
                            <img
                              src={`/spinner_${
                                entries?.booked ? "red" : "green"
                              }.svg`}
                              alt="loading..."
                            />
                          ) : (
                            `${entries?.booked ? "Cancel" : "Book"}`
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AllShifts;
