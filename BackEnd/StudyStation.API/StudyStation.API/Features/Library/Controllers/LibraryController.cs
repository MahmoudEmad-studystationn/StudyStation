using MediatR;
using Microsoft.AspNetCore.Mvc;
using StudyStation.API.Features.Library.Commands;
using StudyStation.API.Features.Library.Queries;

namespace StudyStation.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LibraryController : ControllerBase
    {
        private readonly IMediator _mediator;

        public LibraryController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost("add")]
        public async Task<IActionResult> Add(AddLibraryResourceCommand command)
        {
            var id = await _mediator.Send(command);
            return Ok(new { ResourceId = id });
        }

        [HttpGet("all")]
        public async Task<IActionResult> GetAll()
        {
            var result = await _mediator.Send(new GetAllResourcesQuery());
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _mediator.Send(new GetResourceByIdQuery(id));
            return result == null ? NotFound() : Ok(result);
        }

        [HttpPut("approve/{id}")]
        public async Task<IActionResult> Approve(int id)
        {
            var result = await _mediator.Send(new ApproveResourceCommand(id));
            return result ? Ok() : NotFound();
        }

        [HttpDelete("reject/{id}")]
        public async Task<IActionResult> Reject(int id)
        {
            var result = await _mediator.Send(new RejectResourceCommand(id));
            return result ? Ok() : NotFound();
        }
        [HttpPut("update/{id}")]
        public async Task<IActionResult> Update(int id, UpdateLibraryResourceCommand command)
        {
            if (id != command.Id)
                return BadRequest();

            var result = await _mediator.Send(command);
            return result ? Ok() : NotFound();
        }

    }
}

