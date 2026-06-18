using FluentValidation;
using StudyStation.API.Features.AI.DTOs;

namespace StudyStation.API.Features.AI.Validators
{
    public class AiChatRequestValidator : AbstractValidator<AiChatRequestDto>
    {
        public AiChatRequestValidator()
        {
            RuleFor(x => x.Message)
                .NotEmpty().WithMessage("Message cannot be empty.")
                .MaximumLength(10000).WithMessage("Message must not exceed 10,000 characters.");

            RuleFor(x => x.Context)
                .Must(c => c is "Hub" or "SoloRoom" or "GroupRoom")
                .WithMessage("Context must be 'Hub', 'SoloRoom', or 'GroupRoom'.");
        }
    }

    public class AiGenerateRequestValidator : AbstractValidator<AiGenerateRequestDto>
    {
        private static readonly string[] ValidDifficulties = { "Easy", "Medium", "Hard", "Mixed" };
        private static readonly string[] ValidTypes = { "MCQ", "TrueFalse", "FillBlank", "ShortAnswer", "Mixed" };

        public AiGenerateRequestValidator()
        {
            RuleFor(x => x.Topic)
                .NotEmpty().WithMessage("Topic is required.")
                .MaximumLength(500).WithMessage("Topic must not exceed 500 characters.");

            RuleFor(x => x.Count)
                .InclusiveBetween(1, 50).WithMessage("Count must be between 1 and 50.");

            RuleFor(x => x.Difficulty)
                .Must(d => ValidDifficulties.Contains(d))
                .WithMessage($"Difficulty must be one of: {string.Join(", ", ValidDifficulties)}.");

            RuleFor(x => x.QuestionType)
                .Must(t => ValidTypes.Contains(t))
                .WithMessage($"QuestionType must be one of: {string.Join(", ", ValidTypes)}.");
        }
    }
}
