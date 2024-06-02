function formatUnixTimestamp(unixTimestamp) {
  const date = new Date(unixTimestamp);

  // Format time as hh:mm
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const formattedTime = `${hours}:${minutes}`;

  // Format date as Month name Date
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const month = monthNames[date.getMonth()];
  const day = date.getDate();
  const formattedDate = `${month} ${day}`;

  return { formattedTime, formattedDate };
}

module.exports = {
  formatUnixTimestamp: formatUnixTimestamp,
};
