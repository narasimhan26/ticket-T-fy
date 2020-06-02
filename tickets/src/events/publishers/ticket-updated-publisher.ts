import { Publisher, Subjects, TicketUpdatedEvent } from '@kslntickets/common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
} 