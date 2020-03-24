export const itemMatchesFilter = (item: any, filterString: string) => {
  return item.name.toLowerCase().indexOf(filterString.toLowerCase()) > -1;
};
