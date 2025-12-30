import { Component, OnInit, DestroyRef, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { GroupService } from '../../services/group.service';
import { GroupDto } from '../../models/group.model';
import { GroupEditDialogComponent } from '../group-edit-page/group-edit-dialog.component';
import { TranslateModule } from '@ngx-translate/core';
import { MatCardModule } from '@angular/material/card';
import { RouterModule } from '@angular/router';
import { filter, take, tap } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ViewChild } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-groups',
  templateUrl: './groups-page.component.html',
  styleUrls: ['./groups-page.component.scss'],
  imports: [
    CommonModule,
    MatTableModule, MatPaginatorModule, MatSortModule,
    MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule,
    MatDialogModule, MatCardModule, TranslateModule,
    RouterModule
  ]
})
export class GroupsPageComponent implements OnInit {
  private service = inject(GroupService);
  private dialog = inject(MatDialog);
  private destroyRef = inject(DestroyRef);

  displayedColumns = ['id', 'title', 'description', 'actions'];

  loading = signal(false);
  groups = signal<GroupDto[]>([]);

  dataSource = new MatTableDataSource<GroupDto>([]);

  @ViewChild(MatPaginator)
  set paginator(p: MatPaginator | undefined) {
    if (p) this.dataSource.paginator = p;
  }

  @ViewChild(MatSort)
  set sort(s: MatSort | undefined) {
    if (s) this.dataSource.sort = s;
  }

  ngOnInit(): void {
    this.dataSource.filterPredicate = (data, filter) =>
      (data.title ?? '').toLowerCase().includes(filter) ||
      (data.description ?? '').toLowerCase().includes(filter);

    this.refresh();
  }

  refresh() {
    this.loading.set(true);
    this.service.list().pipe(
      tap(list => {
        this.groups.set(list);
        this.dataSource.data = list; 
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: () => this.loading.set(false),
      error: () => this.loading.set(false)
    });
  }

  create() {
    this.dialog.open(GroupEditDialogComponent, {
      width: 'min(600px, 92vw)',
      maxWidth: '92vw',
      data: { mode: 'create' as const }
    }).afterClosed().pipe(
      filter(Boolean),
      take(1)
    ).subscribe(() => this.refresh());
  }

  edit(row: GroupDto) {
    this.dialog.open(GroupEditDialogComponent, {
      width: 'min(600px, 92vw)',
      maxWidth: '92vw',
      data: { mode: 'edit' as const, group: row }
    }).afterClosed().pipe(
      filter(Boolean),
      take(1)
    ).subscribe(() => this.refresh());
  }

  remove(row: GroupDto) {
    if (!row.id) return;
    this.service.delete(row.id).pipe(take(1)).subscribe({
      next: () => this.refresh(),
      error: () => {}
    });
  }
}
