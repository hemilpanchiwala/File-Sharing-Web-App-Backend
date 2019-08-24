#include <iostream>
#include <math.h>

using namespace std;

int getSumUtil(int* st, int ss, int se, int qs, int qe, int si){

  if(qs <= ss && qe >= se){
    return st[si];
  }

  if(se < qs || ss > qe){
    return 0;
  }

  int mid = ss + (se - ss)/2;
  return (getSumUtil(st, ss, mid, qs, qe, 2*si+1) + 
          getSumUtil(st, mid+1, se, qs, qe, 2*si+2));

}

int getSum(int* st, int n, int qs, int qe){

  return getSumUtil(st, 0, n-1, qs, qe, 0);

}

int constructSTUtil(int* arr, int ss, int se, int* st, int si){

  if(ss == se){
    st[si] = arr[ss];
    return arr[ss];
  }

  int mid = ss + (se - ss)/2;
  st[si] = constructSTUtil(arr, ss, mid, st, 2*si+1) + 
            constructSTUtil(arr, mid+1, se, st, 2*si+2);

  return st[si];

}

int* constructST(int* arr, int n){

  int x = (int)(ceil(log2(n)));

  int max_size = 2*(int)pow(2, x) - 1;

  int* st = new int[max_size];

  constructSTUtil(arr, 0, n-1, st, 0);

  return st;

}

int main() {
  int arr[] = {1, 3, 5, 7, 9, 11};
  int n = 6;

  int* st = constructST(arr, n);

  cout<<getSum(st, n, 1, 3)<<endl;
}