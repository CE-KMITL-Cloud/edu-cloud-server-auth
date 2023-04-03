import { IsString, Matches, MaxLength, MinLength } from 'class-validator'

export const ValidatePassword = (): PropertyDecorator => (target: any, propertyKey: string | symbol) => {
  IsString()(target, propertyKey)
  MinLength(8)(target, propertyKey)
  MaxLength(50)(target, propertyKey)
  Matches(/^(?=.*[A-Z])(?=.*[0-9])(?=.*[a-z]).*$/, {
    message: `${String(propertyKey)} too weak`,
  })(target, propertyKey)
}
