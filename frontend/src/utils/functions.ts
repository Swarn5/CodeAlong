const capitalize = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

const getTimePassed = (createdAt: string) => {
  const createdDate = new Date(createdAt);
  const currentDate = new Date();
  const differenceInMs = currentDate.getTime() - createdDate.getTime();
  const differenceInMinutes = Math.floor(differenceInMs / (1000 * 60));
  const differenceInHours = Math.floor(differenceInMinutes / 60);
  const differenceInDays = Math.floor(differenceInHours / 24);

  if (differenceInMinutes < 60) {
    return differenceInMinutes === 1
      ? `${differenceInMinutes} min`
      : `${differenceInMinutes} mins`;
  } else if (differenceInHours < 24) {
    return differenceInHours === 1
      ? `${differenceInHours} hr`
      : `${differenceInHours} hrs`;
  } else {
    return differenceInDays === 1
      ? `${differenceInDays} day`
      : `${differenceInDays} days`;
  }
};

export { capitalize, getTimePassed };
