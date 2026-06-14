using MediatR;
using StudyStation.API.Features.StudyWithFriends.DTOs;

namespace StudyStation.API.Features.StudyWithFriends.Queries;

public record GetCurrentFocusSessionQuery(int RoomId)
    : IRequest<FocusSessionDto?>;