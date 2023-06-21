/* eslint-disable @typescript-eslint/dot-notation */
import { Component, OnInit } from '@angular/core';
import { combineLatest, first, lastValueFrom, map } from 'rxjs';
import { Member } from 'src/app/models/member.model';
import { Post } from 'src/app/models/post.model';
import { DbService, leftJoinDocument } from 'src/services/db.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  members: Member[];
  posts: Post[];
  joinPosts: Post[];
  isActiveCheckbox = false;

  constructor(private db: DbService) {}

  async ngOnInit(): Promise<void> {
    this.joinPosts = await this.getMembers();
    console.log('this.joinPosts :', this.joinPosts);
  }

  /**
   * interface 상속이나 병합없이 기본 선언된 interface 그대로 사용한 함수
   * userId에 member 정보 그대로 join하는 경우
   */
  async getMembers(): Promise<Post[]> {
    const members$ = this.db.collection$(`members`);
    const posts$ = this.db.collection$(`posts`);

    return await lastValueFrom(
      combineLatest([members$, posts$]).pipe(
        map(([members, posts]: [Member[], Post[]]): Post[] =>
          posts.map((post: Post): Post => {
            const match = members.find(
              (member) => Number(member.id) === Number(post.userId)
            );
            return match ? { ...post, userId: match } : post;
          })
        ),
        first()
      )
    );
  }

  /**
   * leftJoinDocument으로 데이터 엮을때
   */
  async getLeftJoinMembers(): Promise<Post[]> {
    return await lastValueFrom(
      this.db.collection$(`posts`).pipe(
        leftJoinDocument(this.db.firestore, 'userId', 'members'),
        map((posts: Post[]): Post[] => posts)
      )
    );
  }

  /**
   * 선언된 interface에 없던 새로운 필드를 추가해주려고 할 때
   *
   * 주로 데이터 특정 조건에 따라 활성화/비활성화(true/false) 값을 줘야하는 경우
   * interface에 없는 isActived 라거나 isChecked 와 같은 필드를 추가해주게 되는데,
   * 이때 타입 에러 발생.
   */
  async getSecondDiffMembers(): Promise<Post[]> {
    return await lastValueFrom(
      this.db.collection$(`posts`).pipe(
        leftJoinDocument(this.db.firestore, 'userId', 'members'),
        map((posts: Post[]): Post[] =>
          posts.map((post: Post): Post => {
            if (post.userId['address'].suite.includes('Suite')) {
              return { ...post, isMatch: true };
            } else {
              return { ...post, isMatch: false };
            }
          })
        ),
        first()
      )
    );
  }

  toggleCheckbox() {
    this.isActiveCheckbox = !this.isActiveCheckbox;
  }
}
