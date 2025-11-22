export const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
    }).format(amount);
};

export const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
};

export const truncateText = (text: string, length: number) => {
    if (text.length <= length) return text;
    return text.slice(0, length) + '...';
};

export const getInitials = (name: string) => {
    if (!name) return '';
    const parts = name.split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};
