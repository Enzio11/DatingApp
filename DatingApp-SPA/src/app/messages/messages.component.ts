import { Component, OnInit } from '@angular/core';
import { Pagination, PaginatedResult } from '../_models/pagination';
import { Message } from '../_models/Message';
import { UserService } from '../_services/user.service';
import { AuthService } from '../_services/auth.service';
import { ActivatedRoute } from '@angular/router';
import { AlertifyService } from '../_services/alertify.service';
import { error } from '@angular/compiler/src/util';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css'],
})
export class MessagesComponent implements OnInit {
  messages: Message[];
  pagination: Pagination;
  messageContainer = 'Unread';

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private route: ActivatedRoute,
    private alertify: AlertifyService
  ) {}

  ngOnInit() {
    this.route.data.subscribe((data) => {
      this.messages = data['messages'].result;
      this.pagination = data['messages'].pagination;
    });
  }

  loadMessages() {
    this.userService
      .getMessages(
        this.authService.decodedToken.nameid,
        this.pagination.currentPage,
        this.pagination.itemsPerPage,
        this.messageContainer
      )
      .subscribe(
        (res: PaginatedResult<Message[]>) => {
          this.messages = res.result;
          this.pagination = res.pagination;
        },
        (error) => {
          this.alertify.error(error);
        }
      );
  }

  deleteMessage(id: number) {
    this.alertify.confirm('Are you sure???', () => {
      this.userService
        .deleteMessage(id, this.authService.decodedToken.nameid)
        .subscribe(
          () => {
            this.messages.splice(
              this.messages.findIndex((m) => m.id === id),
              1
            );
            this.alertify.success('Message has been deleted');
          },
          (error) => {
            this.alertify.error('Failed');
          }
        );
    });
  }

  pageChanged(event: any): void {
    this.pagination.currentPage = event.page;
    this.loadMessages();
  }
}
