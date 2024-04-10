import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'notInDomainBlacklist', async: false })
export class NotInDomainBlacklistValidator
  implements ValidatorConstraintInterface
{
  validate(email: string, args: ValidationArguments) {
    const domainBlacklist = args.constraints[0]; // Получаем массив запрещенных доменов
    if (!email) return false;

    // Разбиваем email на имя пользователя и домен
    const [_, domain] = email.split('@');

    // Проверяем, что домен email не находится в списке запрещенных доменов
    return !domainBlacklist.includes(domain);
  }

  defaultMessage(args: ValidationArguments) {
    return `Email domain is not allowed`;
  }
}
