using StudyStation.API.Features.SavedItems.Models;

namespace StudyStation.API.Features.SavedItems.DTOs
{
    public class SaveItemRequest
    {
        public int ItemId { get; set; }
        public SavedItemType ItemType { get; set; }
    }
}
