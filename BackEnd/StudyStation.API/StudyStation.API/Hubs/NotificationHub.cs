using Microsoft.AspNetCore.SignalR;

namespace StudyStation.API.Hubs
{
    public class NotificationHub : Hub
    {
        // يمكنك إضافة دوال هنا في المستقبل لإرسال إشعارات لمستخدمين محددين
        // public async Task SendMessage(string user, string message)
        // {
        //     await Clients.User(user).SendAsync("ReceiveMessage", message);
        // }
    }
}
