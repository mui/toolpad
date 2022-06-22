const getReadableDuration = (editedAt: Date) => {
  const duration = new Date().getTime() - editedAt.getTime();
  const delta = Math.floor(duration / 1000);

  const minute = 60;
  const hour = minute * 60;
  const day = hour * 24;
  const week = day * 7;

  let readableDuration = '';

  if (delta < 30) {
    readableDuration = 'Just now';
  } else if (delta < minute) {
    readableDuration = `${delta} seconds ago`;
  } else if (delta < 2 * minute) {
    readableDuration = 'A minute ago';
  } else if (delta < hour) {
    readableDuration = `${Math.floor(delta / minute)} minutes ago`;
  } else if (Math.floor(delta / hour) === 1) {
    readableDuration = '1 hour ago';
  } else if (delta < day) {
    readableDuration = `${Math.floor(delta / hour)}  hours ago`;
  } else if (delta < day * 2) {
    readableDuration = 'Yesterday';
  } else if (delta < week) {
    readableDuration = `${Math.floor(delta / day)}  days ago`;
  } else {
    readableDuration = `${Math.floor(delta / week)} weeks ago`;
  }
  return readableDuration;
};

export default getReadableDuration;
