export const getUTCDate = (dateString = Date.now()) => {
  const date = new Date(dateString);

  return new Date(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds()
  );
};

// formatDate(new Date(), 'DD MMM, YYYY HH:mm:ss') // returns local time
// formatDate(getUTCDate(), 'DD MMM, YYYY HH:mm:ss') // returns UTC time
