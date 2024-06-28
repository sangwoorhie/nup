import { User } from 'src/entities/user.entity';
import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';

export default class UserSeeder implements Seeder {
  async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<any> {
    const repository = dataSource.getRepository(User);

    repository.insert([
      {
        email: 'komapper@naver.com',
        password: '1234',
        username: 'soorakjung',
      },
    ]);
  }
}
