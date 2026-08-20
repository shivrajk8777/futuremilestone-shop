import { Db } from 'mongodb';

interface CounterDoc {
  _id: string;
  seq: number;
}

/**
 * Atomically generates a date-based sequential Order / Bill Number.
 * Format: FM + YYMMDD + 3-digit serial number (e.g. FM260818001, FM260820001)
 */
export async function generateOrderNumber(db: Db): Promise<string> {
  const now = new Date();
  const yy = now.getFullYear().toString().slice(-2);
  const mm = (now.getMonth() + 1).toString().padStart(2, '0');
  const dd = now.getDate().toString().padStart(2, '0');
  const dateKey = `${yy}${mm}${dd}`; // e.g. "260820"

  try {
    const counterCollection = db.collection<CounterDoc>('counters');
    const counter = await counterCollection.findOneAndUpdate(
      { _id: `order_number_${dateKey}` as any },
      { $inc: { seq: 1 } },
      { upsert: true, returnDocument: 'after' }
    );

    const counterAny = counter as any;
    const seqValue = counterAny?.seq ?? counterAny?.value?.seq ?? 1;
    const serialStr = Number(seqValue).toString().padStart(3, '0');

    return `FM${dateKey}${serialStr}`;
  } catch (error) {
    console.error('Error generating date-based order number:', error);
    const fallbackSerial = Math.floor(1 + Math.random() * 999).toString().padStart(3, '0');
    return `FM${dateKey}${fallbackSerial}`;
  }
}
