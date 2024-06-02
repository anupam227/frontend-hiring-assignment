import { useEffect, useState } from "react";
import { formatUnixTimestamp } from "../utils";
import { BASE_URL } from "../constant";
import "../assets/myShifts.css";

const BookedShifts = ({ bookedShifts = [], fetchShiftData = () => {} }) => {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingId, setLoadingId] = useState("");

  const now = Date.now();

  const filterEvents = () => {
    const groupedEvents = bookedShifts.reduce((acc, event) => {
      if (event.booked) {
        const { formattedTime: formattedStartTime, formattedDate } =
          formatUnixTimestamp(event.startTime);
        const { formattedTime: formattedEndTime } = formatUnixTimestamp(
          event.endTime
        );
        if (!acc || !acc[formattedDate]) {
          acc[formattedDate] = [];
        }
        const isEventStarted = now >= event.startTime;

        acc[formattedDate].push({
          ...event,
          formattedEndTime: formattedEndTime,
          formattedStartTime: formattedStartTime,
          isEventStarted: isEventStarted,
        });
      }
      return acc;
    }, {});

    // sorting data on the bases of start time
    for (const date in groupedEvents) {
      groupedEvents[date].sort((a, b) => a.startTime - b.startTime);
    }
    setShifts(groupedEvents);
  };

  useEffect(() => {
    if (bookedShifts.length > 0) {
      filterEvents();
    }
  }, [bookedShifts]);

  const handleCancelEvent = async (eventId) => {
    try {
      setLoading(true);
      setLoadingId(eventId);
      const res = await fetch(`${BASE_URL}shifts/${eventId}/cancel`, {
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

    const calculateTotalHours = (shifts) => {
    const totalHoursByDate = {};

    for (const date in shifts) {
      let totalMinutes = 0;
      shifts[date].forEach((shift) => {
        const start = new Date(shift.startTime);
        const end = new Date(shift.endTime);
        const duration = (end - start) / (1000 * 60); // duration in minutes
        totalMinutes += duration;
      });

      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;

      totalHoursByDate[date] = minutes > 0 ? `${hours}h:${minutes}m` : `${hours}h`;
    }

    return totalHoursByDate;
  };

    const totalHours = calculateTotalHours(shifts);
    
  return (
    <div className="container">
      <div className="wrapper">
        {!shifts || shifts?.length === 0 ? (
          <div>No events found</div>
        ) : (
          Object.entries(shifts).map((_val, idx) => {
            return (
              <div key={idx} className="card">
                <div className="head">
                  <span className="headDate">{_val[0]}</span>
                        <span className="supportText">{_val[1]?.length} shifts, {totalHours[_val[0]]}</span>
                </div>
                {_val[1].map((entries) => {
                  return (
                    <div key={entries?.id} className="listWrapper">
                      <div className="leftSection">
                        <span className="time">
                          {entries?.formattedStartTime}-
                          {entries?.formattedEndTime}
                        </span>
                        <span className="city">{entries?.area}</span>
                      </div>
                      <button
                        className={`button ${
                          entries?.isEventStarted && "disable-r"
                        }`}
                        onClick={() => handleCancelEvent(entries.id)}
                        disabled={entries?.isEventStarted}
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

export default BookedShifts;
