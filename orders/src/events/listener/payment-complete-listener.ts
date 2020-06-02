import { Message } from 'node-nats-streaming';
import { Listener, PaymentCompleteEvent, Subjects, NotFoundError, orderStatus } from '@kslntickets/common';
import { Order } from '../../models/order';
import { queueGroupName } from '../listener/queue-group-name'; 

export class PaymentCompleteListener extends Listener<PaymentCompleteEvent> {
  subject: Subjects.PaymentCompleted = Subjects.PaymentCompleted;
  queueGroupName = queueGroupName;

  async onMessage(data: PaymentCompleteEvent['data'], msg: Message){
    const order = await Order.findById(data.orderId);

    if (!order) {
      throw new NotFoundError();
    }

    order.set({
      status: orderStatus.Complete
    });
    await order.save();

    msg.ack()
  }
}