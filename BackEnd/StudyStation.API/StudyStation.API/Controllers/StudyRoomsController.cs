using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using StudyStation.API.Features.StudyWithFriends.Commands;
using StudyStation.API.Features.StudyWithFriends.DTOs;
using StudyStation.API.Features.StudyWithFriends.Queries;

namespace StudyStation.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class StudyRoomsController : ControllerBase
{
    private readonly IMediator _mediator;

    public StudyRoomsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    private int GetCurrentUserId()
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(userIdString, out var userId) ? userId : 0;
    }

    [HttpGet]
    public async Task<IActionResult> GetRooms()
    {
        var result = await _mediator.Send(new GetRoomsQuery());
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetRoom(int id)
    {
        var result = await _mediator.Send(new GetRoomDetailsQuery(id));
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> CreateRoom([FromBody] CreateRoomDto dto)
    {
        var userId = GetCurrentUserId();
        var result = await _mediator.Send(new CreateRoomCommand(dto, userId));
        return CreatedAtAction(nameof(GetRoom), new { id = result.Id }, result);
    }

    [HttpPost("{id}/join")]
    public async Task<IActionResult> JoinRoom(int id, [FromQuery] string? roomCode)
    {
        var userId = GetCurrentUserId();
        var success = await _mediator.Send(new JoinRoomCommand(id, userId, roomCode));
        if (!success) return BadRequest("Unable to join room. It may be private or not exist.");
        return Ok(new { message = "Joined successfully" });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteRoom(int id)
    {
        var userId = GetCurrentUserId();
        var success = await _mediator.Send(new DeleteRoomCommand(id, userId));
        if (!success) return Forbid(); // Using Forbid/NotFound appropriately
        return NoContent();
    }

    [HttpPost("{id}/leave")]
    public async Task<IActionResult> LeaveRoom(int id)
    {
        var userId = GetCurrentUserId();
        var success = await _mediator.Send(new LeaveRoomCommand(id, userId));
        if (!success) return BadRequest("You are not part of this room.");
        return Ok(new { message = "Left successfully" });
    }

    [HttpPost("{id}/tasks")]
    public async Task<IActionResult> CreateTask(int id, [FromBody] string title)
    {
        var userId = GetCurrentUserId();
        var result = await _mediator.Send(new CreateTaskCommand(id, title, userId));
        return Ok(result);
    }

    [HttpPatch("{id}/tasks/{taskId}/toggle")]
    public async Task<IActionResult> ToggleTask(int id, int taskId)
    {
        var result = await _mediator.Send(new ToggleTaskCommand(taskId, id));
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpPut("{id}/tasks/{taskId}")]
    public async Task<IActionResult> UpdateTask(int id, int taskId, [FromBody] UpdateTaskDto dto)
    {
        var result = await _mediator.Send(new UpdateTaskCommand(taskId, id, dto));
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpDelete("{id}/tasks/{taskId}")]
    public async Task<IActionResult> DeleteTask(int id, int taskId)
    {
        var success = await _mediator.Send(new DeleteTaskCommand(taskId, id));
        if (!success) return NotFound();
        return NoContent();
    }

    [HttpPost("{id}/focus/start")]
    public async Task<IActionResult> StartFocusSession(int id, [FromBody] int durationMinutes)
    {
        var userId = GetCurrentUserId();
        var result = await _mediator.Send(new StartFocusSessionCommand(id, durationMinutes, userId));
        return Ok(result);
    }

    [HttpPost("{id}/focus/{sessionId}/stop")]
    public async Task<IActionResult> StopFocusSession(int id, int sessionId)
    {
        var success = await _mediator.Send(new StopFocusSessionCommand(sessionId, id));
        if (!success) return NotFound();
        return Ok(new { message = "Session stopped" });
    }

    [HttpGet("{id}/focus/current")]
    public async Task<IActionResult> GetCurrentFocusSession(int id)
    {
        var result = await _mediator.Send(
            new GetCurrentFocusSessionQuery(id));

        if (result == null)
            return NotFound();

        return Ok(result);
    }

    [HttpPost("{id}/messages")]
    public async Task<IActionResult> SendMessage(int id, [FromBody] string content)
    {
        var userId = GetCurrentUserId();
        var result = await _mediator.Send(new SendMessageCommand(id, userId, content));
        if (result == null) return BadRequest();
        // Here we could also get an instance of IHubContext<StudyHub, IStudyClient> and broadcast the message
        return Ok(result);
    }

    [HttpGet("{id}/messages")]
    public async Task<IActionResult> GetMessages(int id)
    {
        var userId = GetCurrentUserId();
        var result = await _mediator.Send(new GetRoomMessagesQuery(id, userId));
        if (result == null) return Forbid();
        return Ok(result);
    }
}