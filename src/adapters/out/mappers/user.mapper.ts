import { User } from 'src/application/core/domain/user.entity';
import { Users } from '../domain/user.entity';

export class UserMapper {
  static toDomain(users: Users): User {
    return {
      id: users.id,
      email: users.email,
      password: users.password,
      name: users.name,
      city: users.city,
      uf: users.uf,
      zipcode: users.zipcode,
      person_type: users.person_type,
    };
  }

  static toPersistence(user: User): Users {
    const users = new Users();
    users.id = user.id;
    users.email = user.email;
    users.password = user.password;
    users.name = user.name;
    users.city = user.city;
    users.uf = user.uf;
    users.zipcode = user.zipcode;
    users.person_type = user.person_type;
    return users;
  }
}
