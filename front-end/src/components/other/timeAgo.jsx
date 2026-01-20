import { formatDistanceToNow } from "date-fns";
import { enUS } from "date-fns/locale";
const customLocale = {
  ...enUS,
  formatDistance: (token, count, options) => {
    const result = enUS.formatDistance(token, count, options);
    return result.replace(/^about\s/, "");
  },
};

export function TimeAgo(dateString) {
  return formatDistanceToNow(new Date(dateString), {
    addSuffix: true,
    locale: customLocale,
  });
}
