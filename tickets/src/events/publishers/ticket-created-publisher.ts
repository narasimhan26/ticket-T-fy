import { Publisher, Subjects, TicketCreatedEvent } from '@kslntickets/common';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated;
} 