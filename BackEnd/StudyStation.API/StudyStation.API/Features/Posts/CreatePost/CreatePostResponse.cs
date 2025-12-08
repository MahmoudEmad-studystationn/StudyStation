namespace StudyStation.API.Features.Posts.CreatePost
{
    public class CreatePostResponse
    {
        public int PostId { get; set; }
        public string Message { get; set; } = "Post created successfully.";
    }
}
