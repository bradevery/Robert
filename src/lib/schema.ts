import { z } from 'zod';

export const FormDataSchema = z.object({
  acceptAgreement: z.boolean(),
});
