import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import localizedFormat from 'dayjs/plugin/localizedFormat';

dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);

export const formatDate = (date: string | Date | null, format = 'MMM D, YYYY') => {
    if (!date) return 'N/A';
    return dayjs(date).format(format);
};

export const formatDateTime = (date: string | Date | null) => {
    if (!date) return 'N/A';
    return dayjs(date).format('MMM D, YYYY h:mm A');
};

export const formatRelativeTime = (date: string | Date | null) => {
    if (!date) return 'N/A';
    return dayjs(date).fromNow();
};

export const toISO = (date: Date) => {
    return dayjs(date).toISOString();
};
