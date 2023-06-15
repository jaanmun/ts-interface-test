import { Component, OnInit } from '@angular/core';
import { combineLatest, first, map } from 'rxjs';
import { Member } from 'src/app/models/member.model';
import { Post } from 'src/app/models/post.model';
import { DbService } from 'src/services/db.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  members: Member[];
  posts: Post[];
  joinPosts: Post[];

  constructor(private db: DbService) {}

  ngOnInit() {
    this.getMembers();
  }

  async getMembers() {
    const members$ = this.db.collection$(`members`);
    const posts$ = this.db.collection$(`posts`);
    this.joinPosts = await combineLatest([members$, posts$])
      .pipe(
        map(([members, posts]: [Member[], Post[]]) =>
          posts.map((post: Post) => {
            const match = members.find(
              (member) => Number(member.id) === Number(post.userId)
            );
            return match ? { ...post, userId: match } : post;
          })
        ),
        first()
      )
      .toPromise();
    console.log('this.joinPosts :', this.joinPosts);
  }

  // async getMembersJson() {
  //   this.members = await fetch('https://jsonplaceholder.typicode.com/users')
  //     .then((response) => response.json())
  //     .then((json) => json);

  //   console.log('members :', this.members);
  // }

  // async getPostsJson() {
  //   this.posts = await fetch('https://jsonplaceholder.typicode.com/posts')
  //     .then((response) => response.json())
  //     .then((json) => json);

  //   console.log('posts :', this.posts);
  // }
}
