import { Component, OnInit, ViewChild, inject } from '@angular/core';
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

  displayedColumns = ['id', 'name', 'description', 'actions'];
  dataSource = new MatTableDataSource<GroupDto>([]);
  loading = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit(): void {
    this.refresh();
  }

  applyFilter(value: string) {
    this.dataSource.filter = (value ?? '').trim().toLowerCase();
  }

  refresh() {
    this.loading = true;
    this.service.list().subscribe({
      next: (list) => {
        this.dataSource = new MatTableDataSource<GroupDto>(list);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.dataSource.filterPredicate = (data, filter) =>
          (data.name?.toLowerCase().includes(filter) ||
            (data.description ?? '').toLowerCase().includes(filter));
      },
      error: () => {  },
      complete: () => (this.loading = false),
    });
  }

  create() {
    const ref = this.dialog.open(GroupEditDialogComponent, {
      width: 'min(600px, 92vw)',
      maxWidth: '92vw',
      data: { mode: 'create' }
    });
    ref.afterClosed().subscribe(v => { if (v) this.refresh(); });
  }

  edit(row: GroupDto) {
    const ref = this.dialog.open(GroupEditDialogComponent, {
      width: 'min(600px, 92vw)',
      maxWidth: '92vw',
      data: { mode: 'edit', group: row }
    });
    ref.afterClosed().subscribe(v => { if (v) this.refresh(); });
  }

  remove(row: GroupDto) {
    if (!row.id) return;
    this.service.delete(row.id).subscribe({
      next: () => this.refresh(),
      error: () => {}
    });
  }
}

