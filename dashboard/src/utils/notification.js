import { NotificationProgrammatic as Notification } from 'buefy';
export const notificationTypes = {
    success: {
        type: 'is-success',
        actionText: 'OK',
        // onAction: () => window.open(this.explorer + this.tx, '_blank'),
    },
    info: {
        type: 'is-info',
        actionText: 'OK',
    },
    danger: {
        type: 'is-danger',
        actionText: 'Oh no!',
    },
};
export const showNotification = (message, params = notificationTypes.info) => {
    Notification.open({
        duration: 5000,
        message,
        type: 'is-success',
        position: 'is-top-right',
        actionText: 'OK',
        queue: false,
        ...params,
    });
};
//# sourceMappingURL=notification.js.map