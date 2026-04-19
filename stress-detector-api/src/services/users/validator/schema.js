import Joi from 'joi';

export const userPayloadSchema = Joi.object({
  fullname: Joi.string().required(),
  email: Joi.string()
    .email({
      minDomainSegments: 2,
      tlds: { allow: ['com', 'net', 'example'] },
    })
    .required(),

  password: Joi.string().min(6).required(),

  role: Joi.string().valid('user', 'admin').default('user').required(),
});
