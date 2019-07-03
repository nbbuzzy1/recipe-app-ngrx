import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';

import { Ingredient } from '../../shared/ingredient.model'
import { ShoppingListService } from '../shopping-list.service';
import { Store } from '@ngrx/store';
import * as ShoppingListActions from '../store/shopping-list.actions';
import * as fromShoppingList from '../store/shopping-list.reducer';

@Component({
  selector: 'app-shopping-list-edit',
  templateUrl: './shopping-list-edit.component.html',
  styleUrls: ['./shopping-list-edit.component.css']
})
export class ShoppingListEditComponent implements OnInit, OnDestroy {
  @ViewChild('f', { static: false }) slForm: NgForm;
  subscription: Subscription
  editMode = false;
  editedItemIndex: number;
  editedItem: Ingredient;

  constructor(private slService: ShoppingListService,
              private store: Store<fromShoppingList.AppState>) { }

  ngOnInit() {
    this.subscription = this.store.select('shoppingList').subscribe(stateData => {
      if (stateData.editedIngredientIndex > -1) {
        this.editMode = true;
        this.editedItem = stateData.editedIngredient;
        this.slForm.setValue({
          name: this.editedItem.name,
          amount: this.editedItem.amount
        })
      } else {
        this.editMode = false;
      }
    })
    // this.subscription = this.slService.startedEditing
    //   .subscribe(
    //     (index:number) => {
    //       this.editedItemIndex = index;
    //       this.editMode = true;
    //       this.editedItem = this.slService.getIngredient(index);
    //       this.slForm.setValue({
    //         name: this.editedItem.name,
    //         amount: this.editedItem.amount
    //       })
    //     }
    //   )
  }
  onSubmit(form: NgForm) {
    const value = form.value;
    const newIngredient = new Ingredient(value.name, value.amount);
    if (this.editMode) {
      // this.slService.updateIngredient(this.editedItemIndex, newIngredient)
      this.store.dispatch(new ShoppingListActions.UpdateIngredient({
        index: this.editedItemIndex,
        ingredient: newIngredient
      }))
    } else {
      // this.slService.addIngredient(newIngredient)
      this.store.dispatch(new ShoppingListActions.AddIngredient(newIngredient))
    }
    this.editMode = false;
    form.reset();
  }
  onClearItem() {
    this.slForm.reset();
    this.editMode = false;
    this.store.dispatch(new ShoppingListActions.StopEdit())
  }
  onDeleteItem() {
    // this.slService.deleteIngredient(this.editedItemIndex)
    this.store.dispatch(new ShoppingListActions.DeleteIngredient(this.editedItemIndex))
    this.onClearItem();
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.store.dispatch(new ShoppingListActions.StopEdit());
  }
}