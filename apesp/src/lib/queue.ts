import { v4 as uuidv4 } from "uuid";

/**
 * A mock job queue service.
 * In a real app, this would connect to Redis (BullMQ), RabbitMQ, Kafka, etc.
 * Its purpose is to instantly return a 201/200 to the user while
 * complex calculations (like balance recalculation) happen in the background.
 */
class JobQueue {
  async add(jobName: string, data: any): Promise<{ id: string }> {
    const jobId = uuidv4();
    console.log(`[JobQueue] Enqueued job: ${jobName} (ID: ${jobId})`, data);
    await new Promise((res) => setTimeout(res, 5));

    // Return a mock job object with an ID
    return { id: jobId };
  }
}

export const jobQueue = new JobQueue();
