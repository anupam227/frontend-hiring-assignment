import { useEffect, useState } from "react";
import "./App.css";
import BookedShifts from "./Components/myShifts";
import { BASE_URL, GET_SHIFTS } from "./constant";
import AllShifts from "./Components/allShifts";

function App() {
  const [bookedShifts, setBookedShifts] = useState([]);
  const [allShifts, setAllShifts] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState("");
  const [activeTab, setActiveTab] = useState("user");

  async function fetchShiftData() {
    try {
      const res = await fetch(`${BASE_URL}${GET_SHIFTS}`, {
        method: "GET",
      });
      const shiftData = await res.json();

      // filter shift data based on tab selected by user
      const myShifts = shiftData.filter((_val) => {
        if (selectedFilter !== "") {
          return _val?.area === selectedFilter;
        } else {
          return _val.booked === true;
        }
      });

      setBookedShifts(myShifts);
      setAllShifts(shiftData);
    } catch (err) {
      console.error(err);
    }
  }
  useEffect(() => {
    fetchShiftData();
  }, [selectedFilter]);

  return (
    <div className="App">
      <div className="tabs">
        <div className="tab" onClick={() => setActiveTab("user")}>
          <span className={`tab-heading ${activeTab === "user" && "active"}`}>
            My shifts
          </span>
        </div>
        <div className="tab" onClick={() => setActiveTab("all")}>
          <span className={`tab-heading ${activeTab === "all" && "active"}`}>
            Available shifts
          </span>
        </div>
      </div>
      {activeTab === "user" ? (
        <BookedShifts
          bookedShifts={bookedShifts}
          fetchShiftData={fetchShiftData}
        />
      ) : (
        <AllShifts
          setSelectedFilter={setSelectedFilter}
          bookedShifts={allShifts}
          fetchShiftData={fetchShiftData}
        />
      )}
    </div>
  );
}

export default App;
