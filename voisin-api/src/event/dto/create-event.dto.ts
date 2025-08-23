import { CreateEventInput } from "../validations/event-validation";

export class CreateEventDto implements CreateEventInput{
    titre: string;
    description: string;
    startDate: Date;
    endDate: Date;
    startTime: string;
    endTime: string;
    location: string;
    imageUrl: string;
    createdById: string;
}
