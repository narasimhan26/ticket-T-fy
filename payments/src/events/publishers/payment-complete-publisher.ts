import { Publisher, Subjects, PaymentCompleteEvent } from '@kslntickets/common';

export class PaymentCompletePublisher extends Publisher<PaymentCompleteEvent> {
  subject: Subjects.PaymentCompleted = Subjects.PaymentCompleted;
} 