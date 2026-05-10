const timeToMinutes = (time) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

const minutesToTime = (minutes) => {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;

  return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
};

const generateSlots = (openingTime, closingTime, slotDuration = 60) => {
  const slots = [];

  let start = timeToMinutes(openingTime);
  const end = timeToMinutes(closingTime);

  while (start + slotDuration <= end) {
    slots.push({
      startTime: minutesToTime(start),
      endTime: minutesToTime(start + slotDuration),
    });

    start += slotDuration;
  }

  return slots;
};



module.exports = {generateSlots};